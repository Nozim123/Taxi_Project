import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const provider = url.searchParams.get('provider');
    const transactionId = url.searchParams.get('tx');
    const status = url.searchParams.get('status');

    console.log(`Payment callback: provider=${provider}, tx=${transactionId}, status=${status}`);

    if (!transactionId) {
      throw new Error('Transaction ID missing');
    }

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*, rides(*)')
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found');
    }

    let paymentStatus = 'failed';
    let externalId: string | null = null;

    // Handle provider-specific callbacks
    switch (provider) {
      case 'click': {
        // Click sends POST with payment data
        if (req.method === 'POST') {
          const body = await req.json();
          if (body.error === 0) {
            paymentStatus = 'completed';
            externalId = body.click_trans_id?.toString();
          }
        }
        break;
      }

      case 'payme': {
        // Payme sends POST with result
        if (req.method === 'POST') {
          const body = await req.json();
          if (body.result?.transaction) {
            paymentStatus = 'completed';
            externalId = body.result.transaction;
          }
        }
        break;
      }

      case 'stripe': {
        if (status === 'success') {
          paymentStatus = 'completed';
          // Stripe webhook would provide session details
        } else if (status === 'cancelled') {
          paymentStatus = 'cancelled';
        }
        break;
      }
    }

    // Update transaction
    await supabase
      .from('transactions')
      .update({ 
        status: paymentStatus,
        external_id: externalId,
      })
      .eq('id', transactionId);

    // Update ride payment status
    if (transaction.ride_id) {
      await supabase
        .from('rides')
        .update({ payment_status: paymentStatus })
        .eq('id', transaction.ride_id);
    }

    console.log(`Transaction ${transactionId} updated to ${paymentStatus}`);

    // Redirect user back to app
    const appUrl = Deno.env.get('APP_URL') || 'https://allone-taxi.lovable.app';
    const redirectUrl = `${appUrl}/ride?payment=${paymentStatus}&tx=${transactionId}`;

    return new Response(null, {
      status: 302,
      headers: { 
        ...corsHeaders, 
        'Location': redirectUrl 
      },
    });

  } catch (error) {
    console.error('Payment callback error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Callback failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
