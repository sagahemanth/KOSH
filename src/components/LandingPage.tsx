import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  Lock, 
  MessageCircle,
  IndianRupee,
  ChevronRight,
  Star,
  PlayCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl italic">K</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Kosh</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="hidden sm:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-8">
              <Zap className="w-3 h-3 text-amber-500" /> Trusted by 500+ Private Lenders
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Manage Private Loans <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">With Absolute Precision.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Kosh is the ultimate interest tracker for private lending businesses. Calculate cumulative interest, track payments, and send automated reminders in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group"
              >
                Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-slate-900 transition-all flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" /> Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Hero Image / Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-900/5">
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="Kosh Dashboard Preview" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -top-10 -left-10 hidden lg:block">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Interest Collected</p>
                    <p className="text-xl font-black text-slate-900">₹1,24,500</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 hidden lg:block">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow delay-500">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-600">50+ Active Borrowers</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">Everything you need to scale.</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Stop using notebooks and messy spreadsheets. Kosh automates the hard parts of private lending.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-amber-500" />,
                title: "Real-time Interest",
                desc: "Calculate simple and cumulative interest automatically. No more manual math errors."
              },
              {
                icon: <MessageCircle className="w-6 h-6 text-blue-500" />,
                title: "WhatsApp Reminders",
                desc: "Send professional payment reminders with one click. Improve your collection rate by 40%."
              },
              {
                icon: <Lock className="w-6 h-6 text-emerald-500" />,
                title: "Secure Storage",
                desc: "Store borrower photos, surety details, and loan documents safely in the cloud."
              },
              {
                icon: <Smartphone className="w-6 h-6 text-purple-500" />,
                title: "Borrower Portal",
                desc: "Give your borrowers a dedicated link to check their balance and payment history."
              },
              {
                icon: <Users className="w-6 h-6 text-rose-500" />,
                title: "Multi-User Support",
                desc: "Manage multiple lending businesses or partners from a single dashboard."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
                title: "Data Integrity",
                desc: "Automatic backups and audit logs for every transaction you record."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md">
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">"Kosh changed how I run my business."</h2>
            <p className="text-slate-600 italic">"I used to spend hours every Sunday calculating interest for my 30 borrowers. Now it's all automated. My collections are faster and my records are perfect."</p>
            <div className="flex items-center gap-3 mt-6">
              <img src="https://i.pravatar.cc/100?img=12" className="w-12 h-12 rounded-full" alt="User" />
              <div>
                <p className="font-bold text-slate-900">Rajesh Kumar</p>
                <p className="text-xs text-slate-500">Private Lender, Bangalore</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 opacity-40 grayscale">
            <div className="text-2xl font-black italic tracking-tighter">FINTECH</div>
            <div className="text-2xl font-black italic tracking-tighter">LENDLY</div>
            <div className="text-2xl font-black italic tracking-tighter">SECURE</div>
            <div className="text-2xl font-black italic tracking-tighter">GROWTH</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">Simple, transparent pricing.</h2>
            <p className="text-slate-600">Choose the plan that fits your business scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly */}
            <div className="p-8 rounded-3xl border-2 border-slate-100 hover:border-slate-900 transition-all">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Monthly Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">₹99</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['Unlimited Borrowers', 'WhatsApp Reminders', 'Cloud Backups', 'Basic Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Yearly */}
            <div className="p-8 rounded-3xl border-2 border-amber-500 bg-amber-50/30 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Yearly Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">₹999</span>
                <span className="text-slate-500">/year</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['Everything in Monthly', 'Priority 24/7 Support', 'Custom Reports', 'Save 15% Yearly'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">Ready to professionalize <br /> your lending?</h2>
          <button 
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:bg-slate-100 transition-all shadow-2xl relative z-10"
          >
            Create Your Account Now
          </button>
          <p className="text-slate-400 mt-6 text-sm relative z-10">No credit card required to start.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm italic">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Kosh</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Kosh Finance. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
