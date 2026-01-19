import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, Phone, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  type: "text" | "image" | "location";
}

interface RideChatProps {
  rideId: string;
  otherUserId: string;
  otherUserName: string;
  isDriver?: boolean;
  onClose: () => void;
}

export const RideChat: React.FC<RideChatProps> = ({
  rideId,
  otherUserId,
  otherUserName,
  isDriver = false,
  onClose,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Subscribe to realtime messages
    const channel = supabase
      .channel(`ride-chat-${rideId}`)
      .on("broadcast", { event: "new-message" }, (payload) => {
        const msg = payload.payload as Message;
        setMessages((prev) => [...prev, msg]);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      sender_id: user.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      type: "text",
    };

    setIsLoading(true);
    setNewMessage("");

    // Optimistic update
    setMessages((prev) => [...prev, message]);

    // Broadcast to channel
    await supabase.channel(`ride-chat-${rideId}`).send({
      type: "broadcast",
      event: "new-message",
      payload: message,
    });

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickMessages = isDriver
    ? ["Yo'ldaman!", "5 daqiqada yetib kelaman", "Kutmoqdaman"]
    : ["OK, kutaman", "Tez keling iltimos", "Chiqyapman"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] bg-card rounded-t-3xl border-t border-border/50 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{otherUserName}</p>
            <p className="text-xs text-muted-foreground">
              {isDriver ? "Yo'lovchi" : "Haydovchi"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  message.sender_id === user?.id
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary rounded-bl-sm"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-[10px] opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick messages */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickMessages.map((msg) => (
          <button
            key={msg}
            onClick={() => {
              setNewMessage(msg);
            }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-secondary/50 text-sm hover:bg-secondary transition-colors"
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
            <Image className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Xabar yozing..."
            className="flex-1 bg-secondary/50 border-0"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="taxi-button rounded-full w-10 h-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RideChat;
