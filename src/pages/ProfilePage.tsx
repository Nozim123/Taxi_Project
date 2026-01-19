import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { TiltCard, HoverFloat3D } from "@/components/3d/Parallax3D";
import {
  User, Phone, Mail, MapPin, CreditCard, Home, Briefcase, Star, Edit2,
  Save, X, Plus, Trash2, ArrowLeft, Shield, Clock, Car, LogOut, Camera
} from "lucide-react";

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  icon: "home" | "work" | "other";
}

interface PaymentMethod {
  id: string;
  type: "card" | "click" | "payme";
  name: string;
  details: string;
  isDefault: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "payments" | "stats">("profile");
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    { id: "1", name: "Uy", address: "Sergeli tumani, Toshkent", lat: 41.2350, lng: 69.2150, icon: "home" },
    { id: "2", name: "Ish", address: "Minor, Yunusobod tumani", lat: 41.3256, lng: 69.2845, icon: "work" },
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "1", type: "card", name: "Humo karta", details: "**** 4521", isDefault: true },
    { id: "2", type: "click", name: "Click", details: "+998 90 *** ** 45", isDefault: false },
    { id: "3", type: "payme", name: "Payme", details: "+998 90 *** ** 45", isDefault: false },
  ]);

  const [stats] = useState({
    totalRides: 47,
    totalSpent: 2450000,
    avgRating: 4.9,
    memberSince: "2024-01-15",
    savedOnSurge: 125000,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        email: user?.email || "",
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Ma'lumotlar saqlandi");
      setIsEditing(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    toast.success("Manzil o'chirildi");
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(p => ({ ...p, isDefault: p.id === id }))
    );
    toast.success("Asosiy to'lov usuli o'zgartirildi");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getAddressIcon = (icon: string) => {
    switch (icon) {
      case "home": return Home;
      case "work": return Briefcase;
      default: return MapPin;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Profil</h1>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <TiltCard className="p-8 rounded-3xl glass-card">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-xl"
                >
                  {formData.full_name?.[0]?.toUpperCase() || "U"}
                </motion.div>
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{formData.full_name || "Foydalanuvchi"}</h2>
                <p className="text-muted-foreground">{formData.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-medium">{stats.avgRating}</span>
                  <span className="text-muted-foreground">• {stats.totalRides} safar</span>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="rounded-xl"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Saqlash
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Tahrirlash
                  </>
                )}
              </Button>
            </div>
          </TiltCard>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "profile", icon: User, label: "Ma'lumotlar" },
            { id: "addresses", icon: MapPin, label: "Manzillar" },
            { id: "payments", icon: CreditCard, label: "To'lov" },
            { id: "stats", icon: Clock, label: "Statistika" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <HoverFloat3D floatHeight={5}>
                <div className="p-6 rounded-2xl glass-card space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">To'liq ism</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10 h-12 bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        placeholder="+998 90 123 45 67"
                        className="pl-10 h-12 bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={formData.email}
                        disabled
                        className="pl-10 h-12 bg-secondary/50 opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </HoverFloat3D>

              <HoverFloat3D floatHeight={5}>
                <div className="p-6 rounded-2xl glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-success" />
                    <span className="font-medium">Tasdiqlangan hisob</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sizning hisobingiz tasdiqlangan va xavfsiz. Barcha ma'lumotlar shifrlangan holda saqlanadi.
                  </p>
                </div>
              </HoverFloat3D>
            </motion.div>
          )}

          {activeTab === "addresses" && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {savedAddresses.map((addr, i) => {
                const Icon = getAddressIcon(addr.icon);
                return (
                  <HoverFloat3D key={addr.id} floatHeight={5}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-2xl glass-card flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{addr.name}</p>
                        <p className="text-sm text-muted-foreground">{addr.address}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </HoverFloat3D>
                );
              })}

              <Button className="w-full h-12 rounded-2xl" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Yangi manzil qo'shish
              </Button>
            </motion.div>
          )}

          {activeTab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {paymentMethods.map((method, i) => (
                <HoverFloat3D key={method.id} floatHeight={5}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSetDefaultPayment(method.id)}
                    className={`p-4 rounded-2xl glass-card flex items-center gap-4 cursor-pointer transition-all ${
                      method.isDefault ? "border-primary" : ""
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      method.type === "card" ? "bg-blue-500/10" :
                      method.type === "click" ? "bg-purple-500/10" : "bg-cyan-500/10"
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        method.type === "card" ? "text-blue-500" :
                        method.type === "click" ? "text-purple-500" : "text-cyan-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.details}</p>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        Asosiy
                      </span>
                    )}
                  </motion.div>
                </HoverFloat3D>
              ))}

              <Button className="w-full h-12 rounded-2xl" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                To'lov usuli qo'shish
              </Button>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Jami safarlar", value: stats.totalRides, icon: Car, color: "text-primary" },
                { label: "Sarflangan", value: `${(stats.totalSpent / 1000000).toFixed(1)}M`, icon: CreditCard, color: "text-accent" },
                { label: "Reyting", value: stats.avgRating, icon: Star, color: "text-amber-500" },
                { label: "Tejaldi", value: `${(stats.savedOnSurge / 1000).toFixed(0)}K`, icon: Shield, color: "text-success" },
              ].map((stat, i) => (
                <HoverFloat3D key={stat.label} floatHeight={10}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl glass-card text-center"
                  >
                    <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                </HoverFloat3D>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProfilePage;
