import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { Calendar, TrendingUp, DollarSign, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EarningsChartProps {
  dailyData?: { date: string; earnings: number; trips: number }[];
  weeklyData?: { week: string; earnings: number; trips: number }[];
  monthlyData?: { month: string; earnings: number; trips: number }[];
}

const defaultDailyData = [
  { date: "Dush", earnings: 245000, trips: 18 },
  { date: "Sesh", earnings: 312000, trips: 24 },
  { date: "Chor", earnings: 278000, trips: 21 },
  { date: "Pay", earnings: 356000, trips: 28 },
  { date: "Jum", earnings: 398000, trips: 31 },
  { date: "Shan", earnings: 456000, trips: 35 },
  { date: "Yak", earnings: 234000, trips: 17 },
];

const defaultWeeklyData = [
  { week: "1-hafta", earnings: 1850000, trips: 142 },
  { week: "2-hafta", earnings: 2120000, trips: 165 },
  { week: "3-hafta", earnings: 1980000, trips: 152 },
  { week: "4-hafta", earnings: 2340000, trips: 178 },
];

const defaultMonthlyData = [
  { month: "Yanvar", earnings: 7200000, trips: 548 },
  { month: "Fevral", earnings: 6800000, trips: 512 },
  { month: "Mart", earnings: 8100000, trips: 624 },
  { month: "Aprel", earnings: 7650000, trips: 586 },
  { month: "May", earnings: 8900000, trips: 678 },
  { month: "Iyun", earnings: 9200000, trips: 712 },
];

type Period = "daily" | "weekly" | "monthly";

const EarningsChart: React.FC<EarningsChartProps> = ({
  dailyData = defaultDailyData,
  weeklyData = defaultWeeklyData,
  monthlyData = defaultMonthlyData,
}) => {
  const [period, setPeriod] = useState<Period>("daily");

  const getData = () => {
    switch (period) {
      case "daily": return dailyData;
      case "weekly": return weeklyData;
      case "monthly": return monthlyData;
    }
  };

  const getXKey = () => {
    switch (period) {
      case "daily": return "date";
      case "weekly": return "week";
      case "monthly": return "month";
    }
  };

  const getTotalEarnings = () => {
    return getData().reduce((sum, item) => sum + item.earnings, 0);
  };

  const getTotalTrips = () => {
    return getData().reduce((sum, item) => sum + item.trips, 0);
  };

  const getAveragePerTrip = () => {
    const total = getTotalEarnings();
    const trips = getTotalTrips();
    return trips > 0 ? Math.round(total / trips) : 0;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Daromad tahlili
        </h3>
        <div className="flex gap-1 p-1 rounded-xl bg-secondary">
          {[
            { id: "daily", label: "Kunlik" },
            { id: "weekly", label: "Haftalik" },
            { id: "monthly", label: "Oylik" },
          ].map((p) => (
            <Button
              key={p.id}
              variant={period === p.id ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-lg",
                period === p.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => setPeriod(p.id as Period)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
          <DollarSign className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(getTotalEarnings())}</p>
          <p className="text-xs text-muted-foreground">Jami daromad</p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
          <Car className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold">{getTotalTrips()}</p>
          <p className="text-xs text-muted-foreground">Safarlar</p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
          <TrendingUp className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(getAveragePerTrip())}</p>
          <p className="text-xs text-muted-foreground">O'rtacha/safar</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={getData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey={getXKey()} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.2)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} so'm`,
                name === "earnings" ? "Daromad" : "Safarlar"
              ]}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#colorEarnings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trips bar chart */}
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey={getXKey()} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
              formatter={(value: number) => [`${value} ta`, "Safarlar"]}
            />
            <Bar 
              dataKey="trips" 
              fill="hsl(var(--success))" 
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default EarningsChart;