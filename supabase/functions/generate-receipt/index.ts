import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Receipt {
  id: string;
  ride_id: string;
  transaction_id: string;
  rider_name: string;
  driver_name: string;
  pickup_address: string;
  dropoff_address: string;
  distance_km: number;
  duration_min: number;
  base_fare: number;
  distance_fare: number;
  time_fare: number;
  surge_multiplier: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  completed_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ride_id } = await req.json();

    console.log(`Generating receipt for ride ${ride_id}`);

    // Fetch ride with relations
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select(`
        *,
        rider:profiles!rides_rider_id_fkey(full_name, phone),
        driver:drivers!rides_driver_id_fkey(
          car_brand,
          car_model,
          car_plate,
          user:profiles!drivers_user_id_fkey(full_name, phone)
        )
      `)
      .eq('id', ride_id)
      .single();

    if (rideError || !ride) {
      throw new Error('Ride not found');
    }

    // Fetch transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('ride_id', ride_id)
      .eq('type', 'ride_payment')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Calculate fare breakdown
    const distanceKm = (ride.distance_meters || 0) / 1000;
    const durationMin = (ride.duration_seconds || 0) / 60;
    const baseFare = 5000; // UZS
    const perKmRate = 3000;
    const perMinRate = 500;
    const surgeMultiplier = ride.surge_multiplier || 1;

    const distanceFare = Math.round(distanceKm * perKmRate);
    const timeFare = Math.round(durationMin * perMinRate);
    const totalBeforeSurge = baseFare + distanceFare + timeFare;
    const totalAmount = Math.round(totalBeforeSurge * surgeMultiplier);

    const receipt: Receipt = {
      id: `RCP-${ride_id.slice(0, 8).toUpperCase()}`,
      ride_id: ride.id,
      transaction_id: transaction?.id || 'N/A',
      rider_name: ride.rider?.full_name || 'Unknown Rider',
      driver_name: ride.driver?.user?.full_name || 'Unknown Driver',
      pickup_address: ride.pickup_address || 'Pickup location',
      dropoff_address: ride.dropoff_address || 'Dropoff location',
      distance_km: Math.round(distanceKm * 10) / 10,
      duration_min: Math.round(durationMin),
      base_fare: baseFare,
      distance_fare: distanceFare,
      time_fare: timeFare,
      surge_multiplier: surgeMultiplier,
      total_amount: totalAmount,
      payment_method: ride.payment_method || 'cash',
      payment_status: ride.payment_status || 'pending',
      created_at: ride.created_at,
      completed_at: ride.updated_at,
    };

    // Generate HTML receipt
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - AllOne Taxi</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; background: #0d1117; color: #f0f6fc; }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #f5a623, #e09000); border-radius: 12px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; }
    .title { font-size: 24px; font-weight: bold; }
    .receipt-id { color: #8b949e; font-size: 14px; }
    .section { background: #161b22; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .label { color: #8b949e; }
    .value { font-weight: 500; }
    .divider { border-top: 1px dashed #30363d; margin: 12px 0; }
    .total { font-size: 20px; font-weight: bold; color: #f5a623; }
    .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; }
    .status-completed { background: #238636; }
    .status-pending { background: #d29922; }
    .footer { text-align: center; color: #8b949e; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🚕</div>
    <div class="title">AllOne Taxi</div>
    <div class="receipt-id">${receipt.id}</div>
  </div>
  
  <div class="section">
    <div class="row">
      <span class="label">Status</span>
      <span class="status status-${receipt.payment_status}">${receipt.payment_status.toUpperCase()}</span>
    </div>
    <div class="row">
      <span class="label">Payment</span>
      <span class="value">${receipt.payment_method.toUpperCase()}</span>
    </div>
  </div>
  
  <div class="section">
    <div class="row">
      <span class="label">From</span>
      <span class="value">${receipt.pickup_address}</span>
    </div>
    <div class="row">
      <span class="label">To</span>
      <span class="value">${receipt.dropoff_address}</span>
    </div>
    <div class="divider"></div>
    <div class="row">
      <span class="label">Distance</span>
      <span class="value">${receipt.distance_km} km</span>
    </div>
    <div class="row">
      <span class="label">Duration</span>
      <span class="value">${receipt.duration_min} min</span>
    </div>
  </div>
  
  <div class="section">
    <div class="row">
      <span class="label">Base fare</span>
      <span class="value">${receipt.base_fare.toLocaleString()} UZS</span>
    </div>
    <div class="row">
      <span class="label">Distance (${receipt.distance_km} km)</span>
      <span class="value">${receipt.distance_fare.toLocaleString()} UZS</span>
    </div>
    <div class="row">
      <span class="label">Time (${receipt.duration_min} min)</span>
      <span class="value">${receipt.time_fare.toLocaleString()} UZS</span>
    </div>
    ${receipt.surge_multiplier > 1 ? `
    <div class="row">
      <span class="label">Surge (${receipt.surge_multiplier}x)</span>
      <span class="value">Applied</span>
    </div>
    ` : ''}
    <div class="divider"></div>
    <div class="row">
      <span class="label">Total</span>
      <span class="total">${receipt.total_amount.toLocaleString()} UZS</span>
    </div>
  </div>
  
  <div class="section">
    <div class="row">
      <span class="label">Driver</span>
      <span class="value">${receipt.driver_name}</span>
    </div>
    <div class="row">
      <span class="label">Date</span>
      <span class="value">${new Date(receipt.completed_at).toLocaleDateString('uz-UZ')}</span>
    </div>
    <div class="row">
      <span class="label">Time</span>
      <span class="value">${new Date(receipt.completed_at).toLocaleTimeString('uz-UZ')}</span>
    </div>
  </div>
  
  <div class="footer">
    Rahmat! AllOne Taxi sizning ishonchingiz uchun minnatdor.<br>
    Savollar uchun: +998 71 123 45 67
  </div>
</body>
</html>
    `;

    return new Response(
      JSON.stringify({ 
        success: true, 
        receipt,
        receipt_html: receiptHtml,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Receipt generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Receipt generation failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
