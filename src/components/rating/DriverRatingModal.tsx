import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DriverRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
  driverId: string;
  driverName: string;
  onSubmit?: (rating: number, review: string) => void;
}

const DriverRatingModal: React.FC<DriverRatingModalProps> = ({
  isOpen, onClose, driverName, onSubmit
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {
    if (rating === 0) { toast.error("Iltimos, baho bering"); return; }
    onSubmit?.(rating, review);
    toast.success("Rahmat! Bahoyingiz qabul qilindi");
    onClose();
  };

  const ratingLabels = ["", "Juda yomon", "Yomon", "Yaxshi", "Zo'r", "Ajoyib!"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-card rounded-3xl border shadow-2xl z-50">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full" onClick={onClose}><X className="w-5 h-5" /></Button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"><Star className="w-8 h-8 text-primary" /></div>
              <h2 className="text-xl font-bold mb-1">Safar qanday bo'ldi?</h2>
              <p className="text-muted-foreground">{driverName} haydovchini baholang</p>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button key={star} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} onClick={() => setRating(star)} className="p-1">
                  <Star className={cn("w-10 h-10 transition-colors", (hoveredRating || rating) >= star ? "text-primary fill-primary" : "text-muted-foreground")} />
                </motion.button>
              ))}
            </div>
            <p className="text-center font-medium text-primary mb-6 h-6">{ratingLabels[hoveredRating || rating]}</p>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Izoh (ixtiyoriy)</span></div>
              <Textarea placeholder="Safar haqida fikringiz..." value={review} onChange={(e) => setReview(e.target.value)} className="resize-none rounded-xl" rows={3} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={onClose}>Keyinroq</Button>
              <Button className="flex-1 h-12 rounded-xl taxi-button" onClick={handleSubmit} disabled={rating === 0}>Yuborish</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DriverRatingModal;
