import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, 
  ChevronLeft, MessageSquare, Info 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICoachChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Hasaneen AI Coach. How can I help you with your training or nutrition today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Simulate AI Response (Placeholder for Groq/OpenAI integration)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've analyzed your question about "${userMsg}". Based on your current plan, I recommend focusing on progressive overload while maintaining your 200g protein target. Would you like me to adjust your next workout?` 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto p-4">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Bot size={28} />
        </div>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            AI Coaching
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Pro</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">Always active • Instant response</p>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-white/10' : 'bg-primary/20 text-primary'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 rounded-tr-none' 
                    : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your diet, form, or schedule..."
          className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-6 pr-14 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600 shadow-2xl"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Send size={18} />
        </button>
      </form>
      
      <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-widest font-bold">
        AI may provide general advice. Consult Hasaneen for medical concerns.
      </p>
    </div>
  );
}
