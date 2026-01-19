import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, User, FileText, Camera, Check, ChevronRight, ChevronLeft,
  Upload, Shield, Star, DollarSign, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";

interface DriverFormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  licenseNumber: string;
  carBrand: string;
  carModel: string;
  carColor: string;
  carPlate: string;
  carYear: string;
}

const STEPS = [
  { id: 1, title: "Shaxsiy ma'lumotlar", icon: User },
  { id: 2, title: "Avtomobil", icon: Car },
  { id: 3, title: "Hujjatlar", icon: FileText },
  { id: 4, title: "Tasdiqlash", icon: Check },
];

const BENEFITS = [
  { icon: DollarSign, title: "Yuqori daromad", desc: "Kuniga 500,000+ so'm" },
  { icon: Clock, title: "Erkin grafik", desc: "O'zingiz ishlang" },
  { icon: Shield, title: "Sug'urta", desc: "To'liq himoya" },
  { icon: Star, title: "Bonuslar", desc: "Haftalik mukofotlar" },
];

const DriverRegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DriverFormData>({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    licenseNumber: "",
    carBrand: "",
    carModel: "",
    carColor: "",
    carPlate: "",
    carYear: "",
  });

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const updateField = (field: keyof DriverFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Sign up user
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (signUpError) throw signUpError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not found");

      // Update profile with phone
      await supabase
        .from("profiles")
        .update({ 
          phone: formData.phone,
          role: "driver",
        })
        .eq("id", user.id);

      // Create driver record
      const { error: driverError } = await supabase
        .from("drivers")
        .insert({
          user_id: user.id,
          license_number: formData.licenseNumber,
          car_brand: formData.carBrand,
          car_model: formData.carModel,
          car_color: formData.carColor,
          car_plate: formData.carPlate,
          is_online: false,
        });

      if (driverError) throw driverError;

      toast.success("Ro'yxatdan o'tdingiz!", {
        description: "Hujjatlaringiz tekshirilmoqda. Tez orada sizga xabar beramiz.",
      });

      navigate("/driver");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Xatolik yuz berdi", {
        description: error instanceof Error ? error.message : "Qayta urinib ko'ring",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />

      {/* Back button */}
      <div className="absolute top-4 left-4 z-30">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-card/80 backdrop-blur-lg">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">AllOne</span> haydovchisi bo'ling
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              O'zbekistonning eng yaxshi taksi xizmatida ishlang va yuqori daromad oling.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {BENEFITS.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl bg-card/50 border border-border/50"
                >
                  <benefit.icon className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Car image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 relative"
            >
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80"
                alt="Taxi car"
                className="rounded-3xl w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-3xl" />
            </motion.div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/50"
          >
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <motion.div
                    className={`flex flex-col items-center ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}
                    animate={{ scale: step === s.id ? 1.1 : 1 }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      step >= s.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}>
                      {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs hidden sm:block">{s.title}</span>
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-primary" : "bg-border"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1 - Personal Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-bold mb-4">Shaxsiy ma'lumotlar</h2>
                  <div>
                    <Label>To'liq ism</Label>
                    <Input
                      placeholder="Ism Familiya"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      placeholder="+998 90 123 45 67"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label>Parol</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2 - Vehicle Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-bold mb-4">Avtomobil ma'lumotlari</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Marka</Label>
                      <Input
                        placeholder="Chevrolet"
                        value={formData.carBrand}
                        onChange={(e) => updateField("carBrand", e.target.value)}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input
                        placeholder="Cobalt"
                        value={formData.carModel}
                        onChange={(e) => updateField("carModel", e.target.value)}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Rang</Label>
                      <Input
                        placeholder="Oq"
                        value={formData.carColor}
                        onChange={(e) => updateField("carColor", e.target.value)}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <Label>Yil</Label>
                      <Input
                        placeholder="2022"
                        value={formData.carYear}
                        onChange={(e) => updateField("carYear", e.target.value)}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Davlat raqami</Label>
                    <Input
                      placeholder="01 A 123 AA"
                      value={formData.carPlate}
                      onChange={(e) => updateField("carPlate", e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3 - Documents */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-bold mb-4">Hujjatlar</h2>
                  <div>
                    <Label>Haydovchilik guvohnomasi raqami</Label>
                    <Input
                      placeholder="AB 1234567"
                      value={formData.licenseNumber}
                      onChange={(e) => updateField("licenseNumber", e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Haydovchilik guvohnomasi (old)", icon: FileText },
                      { label: "Haydovchilik guvohnomasi (orqa)", icon: FileText },
                      { label: "Avtomobil texpassporti", icon: Car },
                      { label: "Shaxsiy rasm", icon: Camera },
                    ].map((doc, i) => (
                      <motion.div
                        key={doc.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-secondary/30 border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <doc.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{doc.label}</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG • Max 5MB</p>
                          </div>
                          <Upload className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4 - Confirmation */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-bold mb-4">Ma'lumotlarni tasdiqlang</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-secondary/30">
                      <p className="text-sm text-muted-foreground mb-1">Ism</p>
                      <p className="font-medium">{formData.fullName || "-"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30">
                      <p className="text-sm text-muted-foreground mb-1">Telefon</p>
                      <p className="font-medium">{formData.phone || "-"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30">
                      <p className="text-sm text-muted-foreground mb-1">Avtomobil</p>
                      <p className="font-medium">
                        {formData.carBrand} {formData.carModel} • {formData.carColor} • {formData.carPlate}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Hujjatlar tekshiruvi</p>
                        <p className="text-xs text-muted-foreground">
                          Ro'yxatdan o'tganingizdan so'ng, hujjatlaringiz 24 soat ichida tekshiriladi.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Orqaga
                </Button>
              )}
              {step < 4 ? (
                <Button
                  className="flex-1 taxi-button"
                  onClick={nextStep}
                >
                  Keyingi
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="flex-1 taxi-button"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegisterPage;
