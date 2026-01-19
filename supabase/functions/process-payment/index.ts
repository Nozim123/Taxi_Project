import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  ride_id: string;
  amount: number;
  payment_method: 'click' | 'payme' | 'stripe' | 'cash';
  currency?: string;
  user_id: string;
}

interface ClickPaymentData {
  merchant_id: string;
  service_id: string;
  amount: number;
  transaction_param: string;
  return_url: string;
}

interface PaymePaymentData {
  merchant_id: string;
  amount: number;
  account: { order_id: string };
  callback_url: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ride_id, amount, payment_method, currency = 'UZS', user_id }: PaymentRequest = await req.json();

    console.log(`Processing ${payment_method} payment for ride ${ride_id}, amount: ${amount} ${currency}`);

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        ride_id,
        user_id,
        amount,
        payment_method,
        type: 'ride_payment',
        status: 'pending',
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction creation error:', txError);
      throw new Error('Failed to create transaction');
    }

    let paymentUrl: string | null = null;
    let paymentData: any = null;

    switch (payment_method) {
      case 'click': {
        const CLICK_MERCHANT_ID = Deno.env.get('CLICK_MERCHANT_ID');
        const CLICK_SERVICE_ID = Deno.env.get('CLICK_SERVICE_ID');
        
        if (CLICK_MERCHANT_ID && CLICK_SERVICE_ID) {
          const clickData: ClickPaymentData = {
            merchant_id: CLICK_MERCHANT_ID,
            service_id: CLICK_SERVICE_ID,
            amount: amount,
            transaction_param: transaction.id,
            return_url: `${supabaseUrl}/functions/v1/payment-callback?provider=click&tx=${transaction.id}`,
          };
          
          paymentUrl = `https://my.click.uz/services/pay?service_id=${CLICK_SERVICE_ID}&merchant_id=${CLICK_MERCHANT_ID}&amount=${amount}&transaction_param=${transaction.id}`;
          paymentData = clickData;
        } else {
          // Simulate Click payment for demo
          paymentUrl = null;
          paymentData = { simulated: true, message: 'Click credentials not configured' };
        }
        break;
      }

      case 'payme': {
        const PAYME_MERCHANT_ID = Deno.env.get('PAYME_MERCHANT_ID');
        
        if (PAYME_MERCHANT_ID) {
          const paymeData: PaymePaymentData = {
            merchant_id: PAYME_MERCHANT_ID,
            amount: amount * 100, // Payme uses tiyin (1 sum = 100 tiyin)
            account: { order_id: transaction.id },
            callback_url: `${supabaseUrl}/functions/v1/payment-callback?provider=payme&tx=${transaction.id}`,
          };
          
          // Create Payme checkout URL
          const encoded = btoa(JSON.stringify({
            m: PAYME_MERCHANT_ID,
            ac: { order_id: transaction.id },
            a: amount * 100,
            c: `${supabaseUrl}/functions/v1/payment-callback?provider=payme&tx=${transaction.id}`,
          }));
          
          paymentUrl = `https://checkout.paycom.uz/${encoded}`;
          paymentData = paymeData;
        } else {
          paymentUrl = null;
          paymentData = { simulated: true, message: 'Payme credentials not configured' };
        }
        break;
      }

      case 'stripe': {
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        
        if (STRIPE_SECRET_KEY) {
          // Convert UZS to USD (approximate rate)
          const usdAmount = Math.round(amount / 12500 * 100); // Amount in cents
          
          const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'payment_method_types[]': 'card',
              'line_items[0][price_data][currency]': 'usd',
              'line_items[0][price_data][product_data][name]': `AllOne Taxi Ride - ${ride_id}`,
              'line_items[0][price_data][unit_amount]': usdAmount.toString(),
              'line_items[0][quantity]': '1',
              'mode': 'payment',
              'success_url': `${supabaseUrl}/functions/v1/payment-callback?provider=stripe&tx=${transaction.id}&status=success`,
              'cancel_url': `${supabaseUrl}/functions/v1/payment-callback?provider=stripe&tx=${transaction.id}&status=cancelled`,
              'metadata[transaction_id]': transaction.id,
              'metadata[ride_id]': ride_id,
            }),
          });
          
          const session = await stripeResponse.json();
          paymentUrl = session.url;
          paymentData = { session_id: session.id };
        } else {
          paymentUrl = null;
          paymentData = { simulated: true, message: 'Stripe credentials not configured' };
        }
        break;
      }

      case 'cash': {
        // Mark as pending cash payment - driver will confirm
        await supabase
          .from('transactions')
          .update({ status: 'awaiting_cash' })
          .eq('id', transaction.id);
        
        paymentData = { message: 'Cash payment pending - driver confirmation required' };
        break;
      }
    }

    // Update ride payment status
    await supabase
      .from('rides')
      .update({ 
        payment_method,
        payment_status: payment_method === 'cash' ? 'awaiting_cash' : 'pending',
      })
      .eq('id', ride_id);

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        payment_url: paymentUrl,
        payment_data: paymentData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment processing failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
