import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Sparkles, Trash2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getGeminiResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  context?: string;
}

const SUGGESTED_QUESTIONS = [
  "Calculate 3% interest on 50k for 20 days",
  "Difference between Simple and Cumulative?",
  "How to reduce principal amount?",
  "What is a guarantor?",
  "How to set a reminder?"
];

const ChatBot: React.FC<ChatBotProps> = ({ context = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m **Kosh AI**, your professional lending assistant. \n\nI can help you with:\n- **Precise Interest Calculations** (Simple & Cumulative)\n- **Payment Tracking** guidance\n- **Loan Terms** explanation\n- **App Features** support\n\nHow can I help you manage your loans today?' }
  ]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setIsLoading(true);

    // Prepare history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getGeminiResponse(messageText, history, context);
    
    setMessages(prev => [...prev, { role: 'model', text: response || "I couldn't generate a response." }]);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: 'Chat cleared. How else can I help you?' }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '550px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 w-[350px] sm:w-[420px] mb-4 overflow-hidden flex flex-col transition-all duration-500 ease-in-out"
          >
            {/* Header */}
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Kosh AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Online Assistant</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearChat}
                  title="Clear Chat"
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          msg.role === 'user' ? 'bg-slate-100' : 'bg-slate-900'
                        }`}>
                          {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${
                          msg.role === 'user' 
                            ? 'bg-slate-900 text-white rounded-tr-none shadow-blue-900/10 shadow-lg' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.role === 'model' && (
                            <button 
                              onClick={() => copyToClipboard(msg.text, i)}
                              className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-900"
                              title="Copy to clipboard"
                            >
                              {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          )}
                          {msg.role === 'model' ? (
                            <div className="markdown-body prose prose-sm max-w-none">
                              <Markdown>{msg.text}</Markdown>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length < 3 && !isLoading && (
                  <div className="px-5 py-2 bg-slate-50/50 flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" /> Kosh AI can make mistakes. Verify important info.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-500 ${
          isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-slate-900 text-white'
        }`}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
        )}
      </motion.button>
    </div>
  );
};

export default ChatBot;
