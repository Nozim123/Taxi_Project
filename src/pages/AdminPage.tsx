import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Eye
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock data
const stats = [
  { label: "Total Rides Today", value: "1,234", change: "+12%", icon: Car, trend: "up" },
  { label: "Active Drivers", value: "456", change: "+5%", icon: Users, trend: "up" },
  { label: "Revenue Today", value: "24.5M", suffix: "UZS", change: "+18%", icon: DollarSign, trend: "up" },
  { label: "Avg Wait Time", value: "3.2", suffix: "min", change: "-8%", icon: Clock, trend: "down" },
];

const recentRides = [
  { id: "R001", rider: "Aziz K.", driver: "Bobur T.", pickup: "Chilanzar", dropoff: "Sergeli", fare: 18000, status: "completed", time: "5 min ago" },
  { id: "R002", rider: "Dilnoza S.", driver: "Akmal R.", pickup: "Yunusabad", dropoff: "Mirzo Ulugbek", fare: 22000, status: "in_progress", time: "Now" },
  { id: "R003", rider: "Jasur M.", driver: "Shoxrux B.", pickup: "Mirabad", dropoff: "TTZ", fare: 15000, status: "completed", time: "12 min ago" },
  { id: "R004", rider: "Nilufar A.", driver: "—", pickup: "Olmazor", dropoff: "Chilanzar", fare: 16000, status: "cancelled", time: "18 min ago" },
  { id: "R005", rider: "Bekzod H.", driver: "Sardor K.", pickup: "Sergeli", dropoff: "Yakkasaroy", fare: 28000, status: "completed", time: "25 min ago" },
];

const topDrivers = [
  { name: "Akmal Rahimov", rides: 42, rating: 4.95, earnings: 680000 },
  { name: "Bobur Toshmatov", rides: 38, rating: 4.92, earnings: 620000 },
  { name: "Sardor Karimov", rides: 35, rating: 4.88, earnings: 570000 },
  { name: "Shoxrux Bekmurodov", rides: 33, rating: 4.90, earnings: 540000 },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    completed: "bg-success/20 text-success",
    in_progress: "bg-primary/20 text-primary",
    cancelled: "bg-destructive/20 text-destructive",
    pending: "bg-muted text-muted-foreground",
  };

  const icons = {
    completed: CheckCircle,
    in_progress: Clock,
    cancelled: XCircle,
    pending: AlertCircle,
  };

  const Icon = icons[status as keyof typeof icons] || AlertCircle;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", styles[status as keyof typeof styles])}>
      <Icon size={12} />
      {status.replace("_", " ")}
    </span>
  );
};

const AdminPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
                <LayoutDashboard className="text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Monitor and manage your taxi operations</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Search rides, drivers..." 
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="secondary" size="icon">
                <Filter size={18} />
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} variant="glass-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-bold">
                        {stat.value}
                        {stat.suffix && <span className="text-base font-normal text-muted-foreground ml-1">{stat.suffix}</span>}
                      </p>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      stat.trend === "up" ? "bg-success/20" : "bg-primary/20"
                    )}>
                      <stat.icon className={cn(
                        "w-5 h-5",
                        stat.trend === "up" ? "text-success" : "text-primary"
                      )} />
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 mt-2 text-sm",
                    stat.trend === "up" ? "text-success" : "text-primary"
                  )}>
                    <TrendingUp size={14} className={stat.trend === "down" ? "rotate-180" : ""} />
                    {stat.change} from yesterday
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Rides Table */}
            <div className="lg:col-span-2">
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Rides</CardTitle>
                      <CardDescription>Latest ride activity</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">ID</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Rider</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Driver</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground hidden lg:table-cell">Route</th>
                          <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground">Fare</th>
                          <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRides.map((ride) => (
                          <tr key={ride.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-2 text-sm font-mono text-muted-foreground">{ride.id}</td>
                            <td className="py-3 px-2 text-sm font-medium">{ride.rider}</td>
                            <td className="py-3 px-2 text-sm hidden md:table-cell">{ride.driver}</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <MapPin size={12} className="text-success" />
                                {ride.pickup}
                                <span className="mx-1">→</span>
                                <MapPin size={12} className="text-destructive" />
                                {ride.dropoff}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium">{ride.fare.toLocaleString()}</td>
                            <td className="py-3 px-2 text-center">
                              <StatusBadge status={ride.status} />
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Button variant="ghost" size="icon-sm">
                                <Eye size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Drivers */}
            <div>
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Top Drivers Today</CardTitle>
                  <CardDescription>Highest performing drivers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topDrivers.map((driver, index) => (
                    <div key={driver.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        index === 0 ? "bg-primary text-primary-foreground" :
                        index === 1 ? "bg-accent text-accent-foreground" :
                        "bg-secondary text-secondary-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{driver.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{driver.rides} rides</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            ⭐ {driver.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{(driver.earnings / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">UZS</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card variant="glass" className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button variant="secondary" className="flex-col h-auto py-4">
                    <Users size={20} className="mb-2" />
                    <span className="text-xs">Manage Drivers</span>
                  </Button>
                  <Button variant="secondary" className="flex-col h-auto py-4">
                    <DollarSign size={20} className="mb-2" />
                    <span className="text-xs">Pricing</span>
                  </Button>
                  <Button variant="secondary" className="flex-col h-auto py-4">
                    <MapPin size={20} className="mb-2" />
                    <span className="text-xs">Zones</span>
                  </Button>
                  <Button variant="secondary" className="flex-col h-auto py-4">
                    <AlertCircle size={20} className="mb-2" />
                    <span className="text-xs">Disputes</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
