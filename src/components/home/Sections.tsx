import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Clock, CreditCard, MapPin, Star, Users, Phone, Smartphone, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard, HoverFloat3D, ScaleOnScroll, GlowingBorder } from "@/components/3d/Parallax3D";

const features = [
  {
    icon: Shield,
    title: "Xavfsiz sayohat",
    description: "Barcha haydovchilar tekshirilgan va litsenziyalangan",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop",
  },
  {
    icon: Clock,
    title: "24/7 xizmat",
    description: "Kun bo'yi, hafta bo'yi ishlash, har doim tayyor",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    image: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=400&h=300&fit=crop",
  },
  {
    icon: CreditCard,
    title: "Oson to'lov",
    description: "Click, Payme, naqd va karta bilan to'lash",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
  },
  {
    icon: MapPin,
    title: "Real-time tracking",
    description: "Haydovchini real vaqtda kuzatib boring",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    image: "https://images.unsplash.com/photo-1476973422084-e0fa66ff9456?w=400&h=300&fit=crop",
  },
];

const stats = [
  { value: "500K+", label: "Foydalanuvchilar" },
  { value: "50K+", label: "Haydovchilar" },
  { value: "5M+", label: "Safarlar" },
  { value: "4.9", label: "Reyting", icon: Star },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        <ScaleOnScroll>
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              Afzalliklar
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Nega <span className="gradient-text">AllOne</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Eng zamonaviy taksi xizmati, sizning qulayligingiz uchun yaratilgan
            </p>
          </div>
        </ScaleOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <TiltCard intensity={8}>
                <GlowingBorder>
                  <div className="p-6 rounded-2xl glass-card overflow-hidden group">
                    {/* Image */}
                    <div className="relative h-32 -mx-6 -mt-6 mb-4 overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                    
                    <HoverFloat3D floatHeight={5}>
                      <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 relative -mt-10 z-10 shadow-lg`}>
                        <feature.icon className={`w-7 h-7 ${feature.color}`} />
                      </div>
                    </HoverFloat3D>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </GlowingBorder>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Stats with 3D effect */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5, rotateY: 45 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.1, rotateY: 10 }}
              className="text-center p-6 rounded-2xl glass-card cursor-pointer"
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl md:text-5xl font-bold gradient-text">{stat.value}</span>
                {stat.icon && <stat.icon className="w-6 h-6 text-primary fill-primary" />}
              </div>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Ilovani yuklab oling",
      description: "App Store yoki Play Market orqali",
      icon: Smartphone,
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=300&fit=crop",
    },
    {
      number: "02",
      title: "Manzilni tanlang",
      description: "Qayerga borishni belgilang",
      icon: MapPin,
      image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&h=300&fit=crop",
    },
    {
      number: "03",
      title: "Haydovchini tanlang",
      description: "Eng yaqin va eng yaxshi haydovchi",
      icon: Users,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop",
    },
    {
      number: "04",
      title: "Sayohatni boshlang",
      description: "Xavfsiz va qulay safar",
      icon: ArrowRight,
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=300&fit=crop",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      {/* Animated lines */}
      <div className="absolute inset-0 -z-10">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="hsl(var(--primary) / 0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto">
        <ScaleOnScroll>
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4"
            >
              Qanday ishlaydi
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Qanday ishlaydi?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              4 ta oddiy qadam orqali sayohatingizni boshlang
            </p>
          </div>
        </ScaleOnScroll>

        <div className="relative">
          {/* Connection line with animation */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 origin-left"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                className="relative text-center"
              >
                <TiltCard intensity={5}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.1, 
                      rotateY: 10,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    }}
                    className="relative mx-auto mb-6 rounded-2xl bg-card border border-border/50 overflow-hidden z-10"
                    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                  >
                    {/* Step image */}
                    <div className="relative w-full h-40 overflow-hidden">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                    
                    {/* Icon overlay */}
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    
                    {/* Step number */}
                    <motion.span 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg shadow-primary/30"
                    >
                      {step.number}
                    </motion.span>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const PricingSection: React.FC = () => {
  const plans = [
    {
      name: "Standard",
      price: "3,000",
      unit: "so'm/km",
      features: ["Tez xizmat", "Xavfsiz haydovchilar", "24/7 qo'llab-quvvatlash"],
      popular: false,
    },
    {
      name: "Comfort",
      price: "4,500",
      unit: "so'm/km",
      features: ["Qulay avtomobillar", "Konditsioner", "Professional haydovchilar", "Bepul Wi-Fi"],
      popular: true,
    },
    {
      name: "Business",
      price: "8,000",
      unit: "so'm/km",
      features: ["Premium avtomobillar", "VIP xizmat", "Shaxsiy haydovchi", "Suv va sneklar", "Keng joy"],
      popular: false,
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Narxlar</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Har qanday byudjetga mos xizmat
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative p-8 rounded-3xl border ${
                plan.popular
                  ? "bg-primary/5 border-primary/50"
                  : "bg-card border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  Ommabop
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                <span className="text-muted-foreground">{plan.unit}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.popular ? "taxi-button" : ""}`}
                variant={plan.popular ? "default" : "outline"}
              >
                Tanlash
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const DownloadApp: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ilovani hoziroq <span className="gradient-text">yuklab oling</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              AllOne ilovasi orqali taksi chaqirish yanada osonlashdi. Hoziroq yuklab oling va 20% chegirma oling!
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5 12.5c0-2.5-2-4.5-4.5-4.5s-4.5 2-4.5 4.5 2 4.5 4.5 4.5 4.5-2 4.5-4.5zm-8-5.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/>
                </svg>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Download on</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35l10.25 8.85-10.25 8.85c-.5-.24-.84-.76-.84-1.35zm14.54-8.5l-2.72-2.36 2.72-2.36 3.06 2.64c.34.29.34.79 0 1.08l-3.06 2.64z"/>
                </svg>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Get it on</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative mx-auto w-64 h-[500px] bg-gradient-to-b from-card to-background rounded-[3rem] border-4 border-border/50 overflow-hidden shadow-2xl">
              {/* Phone mockup content */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-foreground/30 rounded-full" />
              
              {/* App screenshot placeholder */}
              <div className="p-4 pt-12">
                <div className="h-32 rounded-xl bg-primary/10 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-20 -left-10 p-3 rounded-xl bg-card border border-border/50 shadow-lg"
            >
              <Star className="w-6 h-6 text-primary fill-primary" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-32 -right-10 p-3 rounded-xl bg-card border border-border/50 shadow-lg"
            >
              <Phone className="w-6 h-6 text-accent" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
