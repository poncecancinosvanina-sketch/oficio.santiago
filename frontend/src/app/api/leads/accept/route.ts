import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { leadId, providerId } = await request.json();

    if (!leadId || !providerId) {
      return NextResponse.json(
        { error: 'ID de solicitud (leadId) y ID de prestador (providerId) son requeridos.' },
        { status: 400 }
      );
    }

    const supabaseService = createServiceClient();

    // 1. Obtener la solicitud para verificar si existe y su costo
    const { data: serviceReq, error: fetchReqError } = await supabaseService
      .from('service_requests')
      .select('status, client_id, lead_fee_charged')
      .eq('id', leadId)
      .single();

    if (fetchReqError || !serviceReq) {
      return NextResponse.json(
        { error: 'La solicitud de servicio no existe.' },
        { status: 404 }
      );
    }

    if (serviceReq.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta solicitud ya ha sido aceptada por otro prestador o no está disponible.' },
        { status: 400 }
      );
    }

    // 2. Intentar aceptar el lead actualizando el estado
    // Esta operación dispara el trigger `trg_process_lead_acceptance` en PostgreSQL.
    // El trigger validará si el proveedor tiene saldo y descontará el costo del lead.
    const { error: updateError } = await supabaseService
      .from('service_requests')
      .update({
        status: 'accepted',
        provider_id: providerId
      })
      .eq('id', leadId)
      .eq('status', 'pending');

    if (updateError) {
      console.error('Error al actualizar la solicitud:', updateError);
      
      // Capturar excepción levantada por el trigger PostgreSQL ("Saldo insuficiente")
      if (updateError.message.includes('Saldo insuficiente')) {
        return NextResponse.json(
          { error: 'Saldo insuficiente en tu billetera. Por favor, cargá saldo para desbloquear este lead de contacto.' },
          { status: 402 } // Payment Required
        );
      }

      return NextResponse.json(
        { error: updateError.message || 'Error al procesar la aceptación de la solicitud.' },
        { status: 500 }
      );
    }

    // 3. Obtener los datos de contacto directo del cliente (Desbloqueado tras compra exitosa)
    const { data: clientData, error: clientFetchError } = await supabaseService
      .from('users')
      .select('name, phone')
      .eq('id', serviceReq.client_id)
      .single();

    if (clientFetchError || !clientData) {
      return NextResponse.json(
        { error: 'El lead fue cobrado pero no se pudieron obtener los datos de contacto del cliente.' },
        { status: 500 }
      );
    }

    // 4. Retornar los datos del contacto desbloqueados
    return NextResponse.json({
      success: true,
      message: 'Lead aceptado y saldo debitado correctamente.',
      client: {
        name: clientData.name,
        phone: clientData.phone,
      }
    });

  } catch (error: any) {
    console.error('Error en API de aceptación de leads:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
