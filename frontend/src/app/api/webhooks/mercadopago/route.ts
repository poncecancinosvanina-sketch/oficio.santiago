import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Mercado Pago puede enviar la información por query params (IPN) o por el JSON body (Webhooks)
    let paymentId = searchParams.get('id') || searchParams.get('data.id');
    let topic = searchParams.get('topic') || searchParams.get('type');

    // Intentar leer del body si no se encuentra en query params
    if (!paymentId || !topic) {
      try {
        const body = await request.json();
        if (body.data && body.data.id) {
          paymentId = body.data.id;
        }
        if (body.type) {
          topic = body.type;
        }
      } catch (e) {
        // El body no es JSON o está vacío, no pasa nada
      }
    }

    // Si la notificación no es de tipo payment, respondemos 200 y salimos
    if (topic !== 'payment' || !paymentId) {
      return NextResponse.json({ message: 'Notificación recibida (no procesable)' }, { status: 200 });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      console.error('Error Webhook MP: Variable MP_ACCESS_TOKEN no configurada.');
      return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
    }

    // 1. Obtener detalles del pago desde Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    
    const paymentDetails = await paymentClient.get({ id: Number(paymentId) });

    if (!paymentDetails || paymentDetails.status !== 'approved') {
      // Respondemos 200 de todas formas a MP para evitar reintentos si el pago está rechazado o pendiente
      return NextResponse.json({ message: 'Pago no aprobado aún' }, { status: 200 });
    }

    // 2. Extraer metadatos
    const providerId = paymentDetails.metadata?.provider_id;
    // Si no está en metadata, usamos el monto total pagado
    const amount = paymentDetails.metadata?.amount_to_credit || paymentDetails.transaction_amount;

    if (!providerId || !amount) {
      console.error('Error Webhook MP: No se encontró provider_id o amount en el pago', paymentId);
      return NextResponse.json({ error: 'Datos de pago incompletos' }, { status: 400 });
    }

    // 3. Procesar en la base de datos de Supabase usando Service Role (Bypass RLS)
    const supabaseService = createServiceClient();

    // Evitar doble acreditación (verificar si ya registramos este mp_payment_id)
    const { data: existingTx, error: txCheckError } = await supabaseService
      .from('transactions')
      .select('id')
      .eq('mp_payment_id', paymentId.toString())
      .single();

    if (existingTx) {
      console.log(`Pago MP ${paymentId} ya acreditado anteriormente.`);
      return NextResponse.json({ message: 'Pago ya procesado' }, { status: 200 });
    }

    if (txCheckError && txCheckError.code !== 'PGRST116') {
      // PGRST116 indica que no encontró filas (lo cual es correcto en este flujo)
      throw txCheckError;
    }

    // Actualizar saldo del prestador y registrar transacción de recarga
    // Se ejecuta usando rpc o transacciones individuales.
    
    // Primero: Registrar la transacción de carga de saldo
    const { error: txInsertError } = await supabaseService
      .from('transactions')
      .insert([
        {
          provider_id: providerId,
          amount: Number(amount),
          type: 'credit_recharge',
          status: 'approved',
          mp_payment_id: paymentId.toString()
        }
      ]);

    if (txInsertError) throw txInsertError;

    // Segundo: Acreditar saldo en la billetera del prestador
    // Obtenemos saldo actual
    const { data: providerData, error: providerFetchError } = await supabaseService
      .from('providers')
      .select('wallet_balance')
      .eq('id', providerId)
      .single();

    if (providerFetchError) throw providerFetchError;

    const newBalance = Number(providerData.wallet_balance) + Number(amount);

    const { error: balanceUpdateError } = await supabaseService
      .from('providers')
      .update({ wallet_balance: newBalance })
      .eq('id', providerId);

    if (balanceUpdateError) throw balanceUpdateError;

    console.log(`Recarga exitosa acreditada al prestador ${providerId}. Monto: $${amount}. Pago MP: ${paymentId}`);

    return NextResponse.json({ success: true, message: 'Saldo acreditado correctamente' }, { status: 200 });

  } catch (error: any) {
    console.error('Error al procesar webhook de Mercado Pago:', error);
    // Respondemos 500 para alertar problemas del servidor, pero ojo: MP reintentará el envío periódicamente.
    return NextResponse.json(
      { error: error.message || 'Error en el servidor al acreditar saldo' },
      { status: 500 }
    );
  }
}
