import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Tag, Percent, DollarSign, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}

const PromoCodeManager: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: "1", code: "WELCOME10", discount_type: "percentage", discount_value: 10, max_discount: 5000, usage_limit: 100, used_count: 45, is_active: true },
    { id: "2", code: "TAXI20", discount_type: "percentage", discount_value: 20, max_discount: 10000, usage_limit: 50, used_count: 23, is_active: true },
    { id: "3", code: "FLAT5000", discount_type: "fixed", discount_value: 5000, max_discount: null, usage_limit: 200, used_count: 87, is_active: true },
    { id: "4", code: "VIP50", discount_type: "fixed", discount_value: 50000, max_discount: null, usage_limit: 10, used_count: 3, is_active: true },
    { id: "5", code: "NEWUSER", discount_type: "percentage", discount_value: 15, max_discount: 7500, usage_limit: null, used_count: 156, is_active: true },
    { id: "6", code: "WEEKEND25", discount_type: "percentage", discount_value: 25, max_discount: 15000, usage_limit: 100, used_count: 12, is_active: true },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    max_discount: 10000,
    usage_limit: 100,
  });

  const handleAddCode = () => {
    if (!newCode.code.trim()) {
      toast.error("Promo kodni kiriting");
      return;
    }

    setPromoCodes(prev => [...prev, {
      id: Date.now().toString(),
      code: newCode.code.toUpperCase(),
      discount_type: newCode.discount_type,
      discount_value: newCode.discount_value,
      max_discount: newCode.discount_type === "percentage" ? newCode.max_discount : null,
      usage_limit: newCode.usage_limit,
      used_count: 0,
      is_active: true,
    }]);

    toast.success("Promo kod qo'shildi");
    setShowAddForm(false);
    setNewCode({ code: "", discount_type: "percentage", discount_value: 10, max_discount: 10000, usage_limit: 100 });
  };

  const toggleActive = (id: string) => {
    setPromoCodes(prev => prev.map(code => code.id === id ? { ...code, is_active: !code.is_active } : code));
    toast.success("Promo kod holati o'zgartirildi");
  };

  const deleteCode = (id: string) => {
    setPromoCodes(prev => prev.filter(code => code.id !== id));
    toast.success("Promo kod o'chirildi");
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat("uz-UZ").format(value);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promo Kodlar</h2>
          <p className="text-muted-foreground">Chegirma kodlarini boshqaring</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="taxi-button">
          <Plus className="w-4 h-4 mr-2" />
          Yangi kod
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-primary/30">
              <CardHeader><CardTitle className="text-lg">Yangi promo kod</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Promo kod</label>
                    <Input placeholder="SUMMER2024" value={newCode.code} onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })} className="uppercase" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Chegirma turi</label>
                    <div className="flex gap-2">
                      <Button variant={newCode.discount_type === "percentage" ? "default" : "outline"} onClick={() => setNewCode({ ...newCode, discount_type: "percentage" })} className="flex-1"><Percent className="w-4 h-4 mr-2" />Foiz</Button>
                      <Button variant={newCode.discount_type === "fixed" ? "default" : "outline"} onClick={() => setNewCode({ ...newCode, discount_type: "fixed" })} className="flex-1"><DollarSign className="w-4 h-4 mr-2" />Belgilangan</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Chegirma qiymati</label>
                    <Input type="number" value={newCode.discount_value} onChange={(e) => setNewCode({ ...newCode, discount_value: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Foydalanish limiti</label>
                    <Input type="number" value={newCode.usage_limit} onChange={(e) => setNewCode({ ...newCode, usage_limit: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}><X className="w-4 h-4 mr-2" />Bekor</Button>
                  <Button onClick={handleAddCode} className="taxi-button"><Check className="w-4 h-4 mr-2" />Saqlash</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {promoCodes.map((code, index) => (
          <motion.div key={code.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className={cn(!code.is_active && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", code.discount_type === "percentage" ? "bg-primary/20" : "bg-success/20")}>
                      {code.discount_type === "percentage" ? <Percent className="w-6 h-6 text-primary" /> : <DollarSign className="w-6 h-6 text-success" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono font-bold text-lg">{code.code}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {code.discount_type === "percentage" ? `${code.discount_value}% chegirma` : `${formatCurrency(code.discount_value)} so'm`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" /><span className="text-sm">{code.used_count} / {code.usage_limit || "∞"}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={code.is_active} onCheckedChange={() => toggleActive(code.id)} />
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCode(code.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PromoCodeManager;
