import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    q: "AllOne Taxi qanday ishlaydi?",
    a: "AllOne ilovasi orqali siz manzilni tanlaysiz, yaqin atrofdagi haydovchilardan birini tanlaysiz va 2-3 daqiqa ichida haydovchi sizga yetib keladi. Barcha to'lovlar naqd yoki Click/Payme orqali amalga oshiriladi.",
  },
  {
    q: "Narxlar qanday hisoblanadi?",
    a: "Narx boshlang'ich tarif + masofa (km uchun) + vaqt (daqiqa uchun) asosida hisoblanadi. Talab yuqori bo'lganda surge narxlash qo'llanilishi mumkin.",
  },
  {
    q: "Haydovchilar xavfsizmi?",
    a: "Ha! Barcha haydovchilar to'liq tekshiruvdan o'tgan, litsenziyalangan va muntazam nazorat qilinadi. Ularning reytingi va sharhlarini ko'rishingiz mumkin.",
  },
  {
    q: "Bekor qilish mumkinmi?",
    a: "Ha, siz buyurtmani haydovchi qabul qilgunga qadar bepul bekor qilishingiz mumkin. Haydovchi qabul qilgandan keyin bekor qilish uchun kichik to'lov olinishi mumkin.",
  },
  {
    q: "Qaysi to'lov usullari mavjud?",
    a: "Biz Click, Payme, bank kartasi va naqd pul to'lovlarini qabul qilamiz. Siz o'zingizga qulay usulni tanlashingiz mumkin.",
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ko'p so'raladigan savollar</h2>
          <p className="text-lg text-muted-foreground">
            Javobingizni topa olmadingizmi? Biz bilan bog'laning
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ContactSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Biz bilan bog'laning</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Savollaringiz bormi? Biz 24/7 yordam berishga tayyormiz
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { icon: Phone, label: "Telefon", value: "+998 71 123 45 67", href: "tel:+998711234567" },
              { icon: Mail, label: "Email", value: "info@allone.uz", href: "mailto:info@allone.uz" },
              { icon: MapPin, label: "Manzil", value: "Toshkent sh., Amir Temur ko'chasi 1", href: "#" },
              { icon: MessageCircle, label: "Telegram", value: "@allone_taxi", href: "https://t.me/allone_taxi" },
            ].map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-card border border-border/50"
          >
            <h3 className="text-xl font-bold mb-6">Xabar yuboring</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Ismingiz" className="bg-secondary/50" />
                <Input placeholder="Telefon" className="bg-secondary/50" />
              </div>
              <Input placeholder="Email" type="email" className="bg-secondary/50" />
              <textarea
                placeholder="Xabaringiz..."
                className="w-full h-32 p-4 rounded-xl bg-secondary/50 border border-border/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="w-full taxi-button h-12 rounded-xl font-semibold">
                Yuborish
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">A</span>
              </div>
              <span className="text-xl font-bold">AllOne</span>
            </div>
            <p className="text-muted-foreground text-sm">
              O'zbekistondagi eng zamonaviy taksi xizmati
            </p>
          </div>
          
          {[
            {
              title: "Kompaniya",
              links: ["Biz haqimizda", "Karyera", "Yangiliklar", "Hamkorlik"],
            },
            {
              title: "Yordam",
              links: ["FAQ", "Qo'llab-quvvatlash", "Xavfsizlik", "Qaytarish"],
            },
            {
              title: "Huquqiy",
              links: ["Maxfiylik", "Shartlar", "Litsenziyalar"],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 AllOne Taxi. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4">
            {["facebook", "instagram", "telegram", "twitter"].map((social) => (
              <a
                key={social}
                href="#"
                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <span className="text-sm capitalize">{social[0].toUpperCase()}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
