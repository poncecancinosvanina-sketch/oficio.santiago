import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const { providerId, amount } = await request.json();

    if (!providerId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'El ID del proveedor y el monto a recargar son requeridos y deben ser válidos.' },
        { status: 400 }
      );
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Mercado Pago credentials (MP_ACCESS_TOKEN) are not configured.' },
        { status: 500 }
      );
    }

    // Inicializar cliente SDK de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new Preference(client);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generar la preferencia de pago
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'credito_virtual',
            title: 'Recarga de Saldo Prepago - Oficios Santiago',
            quantity: 1,
            unit_price: Number(amount),
            currency_id: 'ARS',
          },
        ],
        metadata: {
          provider_id: providerId,
          amount_to_credit: Number(amount),
        },
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${appUrl}/dashboard/billetera?payment=success`,
          failure: `${appUrl}/dashboard/billetera?payment=failure`,
          pending: `${appUrl}/dashboard/billetera?payment=pending`,
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({
      init_point: result.init_point,
      preference_id: result.id,
    });

  } catch (error: any) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud con Mercado Pago.' },
      { status: 500 }
    );
  }
}
