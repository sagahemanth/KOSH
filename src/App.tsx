/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Phone, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight,
  ChevronRight,
  X,
  IndianRupee,
  Archive,
  Upload,
  Camera,
  Trash2,
  FileText,
  Download,
  AlertCircle,
  Bell,
  Calendar,
  LogOut,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  User as UserIcon,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Crown,
  Zap,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import BorrowerDashboard from './components/BorrowerDashboard';
import ChatBot from './components/ChatBot';
import LandingPage from './components/LandingPage';

declare global {
  interface Window {
    Razorpay: any;
  }
}

import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { useAuthState as useFirebaseAuthState } from 'react-firebase-hooks/auth';

const useAuthState = (authInstance: any) => {
  if (isFirebaseConfigured) {
    return useFirebaseAuthState(authInstance);
  }
  return [null, false, undefined] as [User | null | undefined, boolean, any];
};

interface Subscription {
  active: boolean;
  plan_type?: 'monthly' | 'yearly';
  expiry_date?: string;
}

// --- Components ---

const validatePassword = (pass: string) => {
  const minLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  return minLength && hasUpper && hasLower && hasNumber && hasSymbol;
};

const Login = ({ onMockLogin }: { onMockLogin: (email: string, name?: string) => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      if (isFirebaseConfigured) {
        await signInWithPopup(auth, googleProvider);
      } else {
        // Mock Google Sign In
        setTimeout(() => {
          onMockLogin('google-user@example.com', 'Google Developer');
          setLoading(false);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && !validatePassword(password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.');
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
      } else {
        // Mock Email Auth with verification
        setTimeout(() => {
          const mockUsers = JSON.parse(localStorage.getItem('mock_registry') || '[]');
          const cleanEmail = email.toLowerCase().trim();
          
          if (isSignUp) {
            if (mockUsers.find((u: any) => u.email === cleanEmail)) {
              setError('User already exists.');
              setLoading(false);
              return;
            }
            mockUsers.push({ email: cleanEmail, password });
            localStorage.setItem('mock_registry', JSON.stringify(mockUsers));
            onMockLogin(cleanEmail, cleanEmail.split('@')[0]);
          } else {
            const user = mockUsers.find((u: any) => u.email === cleanEmail && u.password === password);
            if (!user) {
              setError('Invalid email or password.');
              setLoading(false);
              return;
            }
            onMockLogin(cleanEmail, cleanEmail.split('@')[0]);
          }
          setLoading(false);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address in the field above first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isFirebaseConfigured) {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent! Please check your inbox (and Spam folder).');
      } else {
        setTimeout(() => {
          alert('Note: Firebase is not fully configured in Settings. (Mock: Reset email sent to ' + email + ')');
          setLoading(false);
        }, 800);
        return;
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address. Please Sign Up first.');
      } else if (err.code === 'auth/invalid-api-key') {
        setError('The API Key in Settings is invalid. Please check your Firebase Project Settings.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is not enabled in your Firebase Console.');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8 bg-slate-900 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-3xl italic">K</span>
          </div>
          <h1 className="text-2xl font-bold">Kosh Finance</h1>
          <p className="text-slate-400 text-sm mt-2">Manage your lending business with precision</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                {!isSignUp && (
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {isSignUp && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Min 8 chars, mix of uppercase, lowercase, numbers & symbols.
                </p>
              )}
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <><UserPlus className="w-5 h-5" /> Create Account</>
              ) : (
                <><LogIn className="w-5 h-5" /> Sign In</>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-900 font-bold hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Types ---

interface Document {
  id: number;
  borrower_id: number;
  name: string;
  type: string;
  data?: string;
  date_uploaded: string;
}

interface Borrower {
  id: number;
  name: string;
  phone: string;
  address: string;
  guarantor: string;
  guarantor_phone: string;
  guarantor_address: string;
  surety_details: string;
  loan_id: number;
  principal: number;
  interest_rate: number;
  date_given: string;
  promise_date: string;
  reminder_date?: string;
  interest_type: 'simple' | 'cumulative';
  deleted_at?: string;
  linked_user_id?: string;
}

interface Transaction {
  id: number;
  loan_id: number;
  date: string;
  amount: number;
  type: 'interest_only' | 'principal_reduction' | 'full_settlement';
}

// --- Utils ---

const calculateMonthsPassed = (startDate: string) => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30); // Use 30 days for market standard
  return Math.max(0, diffMonths);
};

const calculateInterestDue = (borrower: Borrower, transactions: Transaction[]) => {
  const loanTransactions = transactions
    .filter(t => t.loan_id === borrower.loan_id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (loanTransactions.some(t => t.type === 'full_settlement')) {
    return { balance: 0, monthlyInterest: 0, currentPrincipal: 0 };
  }

  const rate = borrower.interest_rate / 100;
  let currentPrincipal = borrower.principal;
  let totalInterestAccrued = 0;
  let lastDate = new Date(borrower.date_given);
  const now = new Date();

  // Calculate interest accrued between transactions based on principal balance at each point
  for (const t of loanTransactions) {
    const currentDate = new Date(t.date);
    if (currentDate > lastDate) {
      const diffTime = currentDate.getTime() - lastDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const diffMonths = diffDays / 30;
      
      if (borrower.interest_type === 'simple') {
        totalInterestAccrued += currentPrincipal * rate * diffMonths;
      } else {
        const interest = currentPrincipal * (Math.pow(1 + rate, diffMonths) - 1);
        totalInterestAccrued += interest;
        currentPrincipal += interest; // Compound interest
      }
    }
    
    if (t.type === 'principal_reduction') {
      currentPrincipal -= t.amount;
    } else if (t.type === 'interest_only' && borrower.interest_type === 'cumulative') {
      currentPrincipal -= t.amount; // Interest payment reduces the compounded balance
    }
    
    lastDate = currentDate;
  }

  // Interest from last transaction to now
  if (now > lastDate) {
    const diffTime = now.getTime() - lastDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffMonths = diffDays / 30;
    
    if (borrower.interest_type === 'simple') {
      totalInterestAccrued += currentPrincipal * rate * diffMonths;
    } else {
      const interest = currentPrincipal * (Math.pow(1 + rate, diffMonths) - 1);
      totalInterestAccrued += interest;
      currentPrincipal += interest;
    }
  }

  const totalInterestPaid = loanTransactions
    .filter(t => t.type === 'interest_only')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalPrincipalPaid = loanTransactions
    .filter(t => t.type === 'principal_reduction')
    .reduce((sum, t) => sum + t.amount, 0);

  const actualCurrentPrincipal = Math.max(0, borrower.principal - totalPrincipalPaid);
  const interestBalance = Math.max(0, totalInterestAccrued - totalInterestPaid);
  const balance = actualCurrentPrincipal + interestBalance;

  const monthlyInterest = actualCurrentPrincipal * rate;

  return { balance, monthlyInterest, currentPrincipal: actualCurrentPrincipal };
};

const getStatus = (promiseDate: string, balance: number) => {
  if (balance <= 0) return 'paid';
  const promise = new Date(promiseDate);
  const now = new Date();
  const diffTime = promise.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 5) return 'due-soon';
  return 'on-track';
};

const calculateDaysSinceLastPayment = (borrower: Borrower, transactions: Transaction[]) => {
  const loanTransactions = transactions.filter(t => t.loan_id === borrower.loan_id);
  if (loanTransactions.length === 0) {
    // If no payments, use date_given as the "last activity"
    const start = new Date(borrower.date_given);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  
  const lastPaymentDate = new Date(Math.max(...loanTransactions.map(t => new Date(t.date).getTime())));
  const now = new Date();
  const diffTime = now.getTime() - lastPaymentDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const SubscriptionSection = ({ subscription, onSubscribe, onApplyPromo, appliedPromoCode }: { subscription: Subscription, onSubscribe: (plan: 'monthly' | 'yearly') => void, onApplyPromo: (code: string) => void, appliedPromoCode: string | null }) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      onApplyPromo(promoCode);
      setPromoCode('');
    } catch (err: any) {
      setPromoMessage({ type: 'error', text: err.message || 'Invalid promo code' });
    }
  };

  return (
    <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Crown className="w-5 h-5 text-amber-500" /> Subscription Plan
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border-2 transition-all ${selectedPlan === 'monthly' || (subscription.plan_type === 'monthly' && subscription.active) ? 'border-slate-900 bg-slate-50' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-900">Monthly Plan</h4>
              <p className="text-2xl font-black text-slate-900 mt-1">₹99<span className="text-sm font-normal text-slate-500">/month</span></p>
            </div>
            {subscription.plan_type === 'monthly' && subscription.active && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Active</span>
            )}
          </div>
          <ul className="space-y-2 mb-6">
            <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Full Access for 30 Days</li>
            <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> All Pro Features</li>
          </ul>
          <button 
            onClick={() => setSelectedPlan('monthly')}
            disabled={subscription.plan_type === 'monthly' && subscription.active}
            className={`w-full py-3 rounded-xl font-bold transition-all ${subscription.plan_type === 'monthly' && subscription.active ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'}`}
          >
            {subscription.plan_type === 'monthly' && subscription.active ? 'Current Plan' : selectedPlan === 'monthly' ? 'Selected' : 'Choose Monthly'}
          </button>
        </div>

        <div className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${selectedPlan === 'yearly' || (subscription.plan_type === 'yearly' && subscription.active) ? 'border-amber-500 bg-amber-50/30' : 'border-slate-100'}`}>
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Best Value</div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-900">Yearly Plan</h4>
              <p className="text-2xl font-black text-slate-900 mt-1">₹999<span className="text-sm font-normal text-slate-500">/year</span></p>
            </div>
            {subscription.plan_type === 'yearly' && subscription.active && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Active</span>
            )}
          </div>
          <ul className="space-y-2 mb-6">
            <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Full Access for 365 Days</li>
            <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Save ₹189 per year</li>
          </ul>
          <button 
            onClick={() => setSelectedPlan('yearly')}
            disabled={subscription.plan_type === 'yearly' && subscription.active}
            className={`w-full py-3 rounded-xl font-bold transition-all ${subscription.plan_type === 'yearly' && subscription.active ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg'}`}
          >
            {subscription.plan_type === 'yearly' && subscription.active ? 'Current Plan' : selectedPlan === 'yearly' ? 'Selected' : 'Choose Yearly'}
          </button>
        </div>
      </div>

      {selectedPlan && !subscription.active && (
        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Plan</p>
              <p className="text-sm font-bold text-slate-900">{selectedPlan === 'monthly' ? 'Monthly Access' : 'Yearly Access'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payable Amount</p>
              <p className="text-sm font-bold text-slate-900">
                {appliedPromoCode === 'FIRST18' ? (
                  <span className="flex flex-col items-end">
                    <span className="text-rose-500 line-through text-[10px]">₹{selectedPlan === 'monthly' ? '99' : '999'}</span>
                    <span>₹18</span>
                  </span>
                ) : (
                  `₹${selectedPlan === 'monthly' ? '99' : '999'}`
                )}
              </p>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Have a Promo Code?
          </h4>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter code" 
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
            />
            <button 
              onClick={handleApplyPromo}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
            >
              Apply
            </button>
          </div>
          {promoMessage && (
            <p className={`mt-2 text-xs font-medium ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {promoMessage.text}
            </p>
          )}

          <button 
            onClick={() => onSubscribe(selectedPlan)}
            className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all"
          >
            Proceed to Payment
          </button>
        </div>
      )}

    </section>
  );
};

const ProfileView = ({ user, subscription, onUpdate, onSubscribe, onApplyPromo, appliedPromoCode }: { user: any, subscription: Subscription, onUpdate: () => void, onSubscribe: (plan: 'monthly' | 'yearly') => void, onApplyPromo: (code: string) => void, appliedPromoCode: string | null }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [email, setEmail] = useState(user.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 1MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [emailPrefs, setEmailPrefs] = useState({
    loanReminders: true,
    paymentConfirmations: true,
    monthlyReports: false
  });

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      setMessage({ type: 'error', text: 'Notifications are not supported by this browser.' });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Notifications Enabled!', {
            body: 'You will now receive alerts for urgent loan reminders.',
            icon: '/icon.svg',
            badge: '/icon.svg'
          });
        });
      } else {
        new Notification('Notifications Enabled!', {
          body: 'You will now receive alerts for urgent loan reminders.',
          icon: '/icon.svg'
        });
      }
      setMessage({ type: 'success', text: 'Mobile notifications enabled!' });
    } else {
      setMessage({ type: 'error', text: 'Notification permission denied.' });
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Test Notification', {
            body: 'This is a test notification from your Finance Manager app.',
            icon: '/icon.svg',
            badge: '/icon.svg'
          });
        });
      } else {
        new Notification('Test Notification', {
          body: 'This is a test notification from your Finance Manager app.',
          icon: '/icon.svg'
        });
      }
    } else {
      requestNotificationPermission();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (isFirebaseConfigured && auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName,
          photoURL 
        });
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      onUpdate();
    } catch (error: any) {
      console.error('Profile update error:', error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ 
          type: 'error', 
          text: 'For security, changing your password requires a fresh login. Please log out and log back in, then try again.' 
        });
      } else {
        setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden border-4 border-slate-50">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  displayName.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-4 right-0 bg-white p-2 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all">
                <Camera className="w-4 h-4 text-slate-600" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              {photoURL && (
                <button 
                  type="button"
                  onClick={() => setPhotoURL('')}
                  className="absolute bottom-4 -left-2 bg-white p-2 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-all"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{displayName || 'User'}</h3>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 w-full">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Your User ID (UID)</p>
              <p className="text-[10px] font-mono text-slate-600 break-all select-all cursor-pointer" title="Click to select all">
                {user.uid}
              </p>
            </div>
            <div className="mt-6 w-full pt-6 border-t border-slate-50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> Account Status
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Verified Account
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserIcon className="w-5 h-5" /> Account Details
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Display Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 cursor-not-allowed"
                    value={email}
                  />
                  <p className="text-[10px] text-slate-400">Email cannot be changed directly for security reasons.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notification Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${notificationPermission === 'granted' ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Mobile Notifications</p>
                    <p className="text-xs text-slate-400">Receive system alerts on your device.</p>
                  </div>
                </div>
                <button 
                  onClick={notificationPermission === 'granted' ? sendTestNotification : requestNotificationPermission}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    notificationPermission === 'granted' 
                    ? 'bg-white text-slate-900 hover:bg-slate-100' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {notificationPermission === 'granted' ? 'Send Test Notification' : 'Enable Now'}
                </button>
              </div>

              {notificationPermission !== 'granted' && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Mobile Setup Guide
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4">
                    <li><strong>Android:</strong> Click "Enable Now" and then "Allow" in the browser popup.</li>
                    <li><strong>iPhone (iOS):</strong> You must first <strong>"Add to Home Screen"</strong> (Share button → Add to Home Screen) to enable push notifications.</li>
                    <li><strong>Brave Browser:</strong> Ensure "Use Google services for push messaging" is ON in Brave settings.</li>
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Email Preferences
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Loan Reminders</p>
                      <p className="text-xs text-slate-500">Receive notifications when a loan payment is due.</p>
                    </div>
                    <button 
                      onClick={() => setEmailPrefs(p => ({ ...p, loanReminders: !p.loanReminders }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${emailPrefs.loanReminders ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailPrefs.loanReminders ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Payment Confirmations</p>
                      <p className="text-xs text-slate-500">Get an email every time a payment is recorded.</p>
                    </div>
                    <button 
                      onClick={() => setEmailPrefs(p => ({ ...p, paymentConfirmations: !p.paymentConfirmations }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${emailPrefs.paymentConfirmations ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailPrefs.paymentConfirmations ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Monthly Reports</p>
                      <p className="text-xs text-slate-500">Receive a summary of your lending activity each month.</p>
                    </div>
                    <button 
                      onClick={() => setEmailPrefs(p => ({ ...p, monthlyReports: !p.monthlyReports }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${emailPrefs.monthlyReports ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailPrefs.monthlyReports ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <SubscriptionSection 
            subscription={subscription} 
            onSubscribe={onSubscribe} 
            onApplyPromo={onApplyPromo} 
            appliedPromoCode={appliedPromoCode}
          />
        </div>
      </div>
    </motion.div>
  );
};

// --- Components ---

const MetricCard = ({ title, value, icon: Icon, trend, subtitle }: { title: string, value: string, icon: any, trend?: string, subtitle?: string }) => (
  <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 md:p-3 bg-slate-50 rounded-xl md:rounded-2xl text-slate-900">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
    {subtitle && <p className="text-[10px] text-slate-400 mt-2">{subtitle}</p>}
  </div>
);

const BorrowerDetailsModal = ({ isOpen, onClose, borrower, transactions, onDelete, onCollectPayment, user, subscription, onShowPaywall }: { isOpen: boolean, onClose: () => void, borrower: Borrower | null, transactions: Transaction[], onDelete: (id: number) => void, onCollectPayment: (loanId: number, amount: number) => void, user: any, subscription: Subscription, onShowPaywall: () => void }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkedUserId, setLinkedUserId] = useState(borrower?.linked_user_id || '');

  useEffect(() => {
    if (borrower) {
      setLinkedUserId(borrower.linked_user_id || '');
    }
  }, [borrower]);

  const getToken = async () => {
    if (user && 'getIdToken' in user) return await user.getIdToken();
    return 'mock-token';
  };

  const fetchDocs = async () => {
    if (!borrower) return;
    const token = await getToken();
    const res = await fetch(`/api/borrowers/${borrower.id}/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setDocs(data);
  };

  useEffect(() => {
    if (isOpen && borrower) {
      fetchDocs();
    }
  }, [isOpen, borrower]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!subscription.active) {
      onShowPaywall();
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !borrower) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const token = await getToken();
      await fetch(`/api/borrowers/${borrower.id}/documents`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          data: base64
        })
      });
      fetchDocs();
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLinkUser = async () => {
    if (!borrower) return;
    setLinking(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/borrowers/${borrower.id}/link`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ linked_user_id: linkedUserId })
      });
      if (res.ok) {
        alert('Borrower linked successfully!');
      } else {
        alert('Failed to link borrower.');
      }
    } catch (error) {
      console.error('Linking error:', error);
    } finally {
      setLinking(false);
    }
  };

  const downloadDoc = async (docId: number, fileName: string) => {
    const token = await getToken();
    const res = await fetch(`/api/documents/${docId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const doc = await res.json();
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = fileName;
    link.click();
  };

  if (!isOpen || !borrower) return null;

  const loanTransactions = transactions.filter(t => t.loan_id === borrower.loan_id);
  const { balance, currentPrincipal, monthlyInterest } = calculateInterestDue(borrower, transactions);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div>
            <h2 className="text-xl font-bold">{borrower.name}</h2>
            <p className="text-slate-400 text-sm">{borrower.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Separate Close Button */}
            <button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6 md:col-span-1">
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Borrower Information</h3>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-sm"><span className="font-semibold">Address:</span> {borrower.address || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Surety:</span> {borrower.surety_details}</p>
                <p className="text-sm text-blue-700 font-medium"><span className="font-semibold">Principal Promise Date:</span> {borrower.promise_date}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Link Borrower to User</h3>
              <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                <p className="text-[10px] text-slate-500 leading-tight">
                  Enter the User ID of the borrower to allow them to view their loan dashboard.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={linkedUserId}
                    onChange={(e) => setLinkedUserId(e.target.value)}
                    placeholder="User ID (UID)"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  />
                  <button 
                    onClick={handleLinkUser}
                    disabled={linking}
                    className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Guarantor / Surety Person</h3>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-sm"><span className="font-semibold">Name:</span> {borrower.guarantor}</p>
                <p className="text-sm"><span className="font-semibold">Phone:</span> {borrower.guarantor_phone || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Address:</span> {borrower.guarantor_address || 'N/A'}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documents</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition-all text-sm font-medium text-slate-600">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Document'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
                <div className="space-y-2">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs font-medium truncate text-slate-700">{doc.name}</span>
                      </div>
                      <button onClick={() => downloadDoc(doc.id, doc.name)} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500 hover:text-slate-900">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Loan Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <p className="text-[10px] uppercase opacity-60">Total Due</p>
                  <p className="text-lg font-bold">₹{Math.round(balance).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl">
                  <p className="text-[10px] uppercase opacity-60">Monthly Interest</p>
                  <p className="text-lg font-bold">₹{Math.round(monthlyInterest).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl">
                  <p className="text-[10px] uppercase opacity-60">Interest Rate</p>
                  <p className="text-lg font-bold">{borrower.interest_rate}% ({borrower.interest_type})</p>
                </div>
                <div className="bg-slate-50 text-slate-700 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase opacity-60">Initial Principal</p>
                  <p className="text-lg font-bold">₹{Math.round(borrower.principal).toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              {!borrower.deleted_at && balance > 0 && (
                <button 
                  onClick={() => onCollectPayment(borrower.loan_id, balance)}
                  className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <IndianRupee className="w-4 h-4" /> Pay Total (₹{Math.round(balance).toLocaleString('en-IN')}) & Close
                </button>
              )}
            </section>

            <section className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment History (EMI Tracking)</h3>
              <div className="flex-1 border border-slate-100 rounded-xl overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 font-semibold text-slate-600">Date</th>
                        <th className="p-3 font-semibold text-slate-600">Amount</th>
                        <th className="p-3 font-semibold text-slate-600">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loanTransactions.map(t => (
                        <tr key={t.id}>
                          <td className="p-3 text-slate-500">{t.date}</td>
                          <td className="p-3 font-bold text-slate-900">₹{Math.round(t.amount).toLocaleString('en-IN')}</td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${t.type === 'interest_only' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {t.type === 'interest_only' ? 'Interest' : 'Principal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {loanTransactions.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-slate-400 italic">No payments recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AddLoanModal = ({ isOpen, onClose, onAdd, user }: { isOpen: boolean, onClose: () => void, onAdd: () => void, user: any }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    guarantor: '',
    guarantor_phone: '',
    guarantor_address: '',
    surety_details: '',
    principal: '',
    interest_rate: '',
    date_given: new Date().toISOString().split('T')[0],
    promise_date: '',
    interest_type: 'simple'
  });
  const [documents, setDocuments] = useState<{ name: string, type: string, data: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        setDocuments(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = user && 'getIdToken' in user ? await user.getIdToken() : 'mock-token';
    await fetch('/api/borrowers', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        principal: parseFloat(formData.principal),
        interest_rate: parseFloat(formData.interest_rate),
        documents
      })
    });
    onAdd();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <h2 className="text-xl font-bold">New Loan Agreement</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Borrower Details</h3>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-semibold text-slate-700">Borrower Address</label>
            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="md:col-span-2 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Guarantor / Surety Person</h3>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Guarantor Name</label>
            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.guarantor} onChange={e => setFormData({...formData, guarantor: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Guarantor Phone</label>
            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.guarantor_phone} onChange={e => setFormData({...formData, guarantor_phone: e.target.value})} />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-semibold text-slate-700">Guarantor Address</label>
            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.guarantor_address} onChange={e => setFormData({...formData, guarantor_address: e.target.value})} />
          </div>

          <div className="md:col-span-2 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Loan Terms</h3>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Principal Amount (₹)</label>
            <input required type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.principal} onChange={e => setFormData({...formData, principal: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Monthly Interest Rate (%)</label>
            <input required type="number" step="0.1" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.interest_rate} onChange={e => setFormData({...formData, interest_rate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Interest Type</label>
            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.interest_type} onChange={e => setFormData({...formData, interest_type: e.target.value as 'simple' | 'cumulative'})}>
              <option value="simple">Simple Interest</option>
              <option value="cumulative">Cumulative (Compounded)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Date Given</label>
            <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.date_given} onChange={e => setFormData({...formData, date_given: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Promise Date</label>
            <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.promise_date} onChange={e => setFormData({...formData, promise_date: e.target.value})} />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-semibold text-slate-700">Surety Details (Land/Property)</label>
            <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none h-24" 
              value={formData.surety_details} onChange={e => setFormData({...formData, surety_details: e.target.value})} />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-semibold text-slate-700">Upload Documents</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition-all text-sm font-medium text-slate-600 bg-slate-50">
                <Upload className="w-5 h-5" />
                Select Documents
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              {documents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                      <FileText className="w-3 h-3" />
                      {doc.name}
                      <button type="button" onClick={() => setDocuments(prev => prev.filter((_, i) => i !== idx))} className="hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
              Create Loan Agreement
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const CollectPaymentModal = ({ isOpen, onClose, loanId, onAdd, suggestedAmount, user }: { isOpen: boolean, onClose: () => void, loanId: number | null, onAdd: () => void, suggestedAmount?: number, user: any }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'interest_only' as 'interest_only' | 'principal_reduction' | 'full_settlement',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen && suggestedAmount !== undefined) {
      setFormData(prev => ({ ...prev, amount: Math.round(suggestedAmount).toString() }));
    }
  }, [isOpen, suggestedAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId) return;
    const token = user && 'getIdToken' in user ? await user.getIdToken() : 'mock-token';
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        loan_id: loanId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date
      })
    });
    onAdd();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <h2 className="text-xl font-bold">Collect Payment</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Payment Amount (₹)</label>
            <input required type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Payment Type</label>
            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.type} onChange={e => {
                const newType = e.target.value as 'interest_only' | 'principal_reduction' | 'full_settlement';
                setFormData({...formData, type: newType});
                if (newType === 'full_settlement' && suggestedAmount !== undefined) {
                  setFormData(prev => ({ ...prev, amount: Math.round(suggestedAmount).toString() }));
                }
              }}>
              <option value="interest_only">Interest Only</option>
              <option value="principal_reduction">Principal Reduction</option>
              <option value="full_settlement">Total Payment (Full Settlement)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Payment Date</label>
            <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg">
              Confirm Payment
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const UpdateReminderModal = ({ isOpen, onClose, borrower, onUpdate, user }: { isOpen: boolean, onClose: () => void, borrower: Borrower | null, onUpdate: () => void, user: any }) => {
  const [reminderDate, setReminderDate] = useState('');

  useEffect(() => {
    if (isOpen && borrower) {
      setReminderDate(borrower.reminder_date || '');
    }
  }, [isOpen, borrower]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrower) return;
    const token = user && 'getIdToken' in user ? await user.getIdToken() : 'mock-token';
    await fetch(`/api/loans/${borrower.loan_id}/reminder-date`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reminder_date: reminderDate })
    });
    onUpdate();
    onClose();
  };

  if (!isOpen || !borrower) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <h2 className="text-xl font-bold">Set EMI Reminder</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl mb-4">
            <p className="text-sm font-medium text-slate-600">Borrower: <span className="text-slate-900 font-bold">{borrower.name}</span></p>
            <p className="text-xs text-slate-500 mt-1">Current Reminder: {borrower.reminder_date || 'None'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Next EMI Promise Date</label>
            <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" 
              value={reminderDate} onChange={e => setReminderDate(e.target.value)} />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" /> Update EMI Reminder
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [firebaseUser, loadingAuth] = useAuthState(auth);
  const [mockUser, setMockUser] = useState<any>(() => {
    const saved = localStorage.getItem('mock_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          getIdToken: async () => `mock-token-${parsed.uid}`
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  // Use firebase user if available, otherwise use mock user if set
  const user = firebaseUser || mockUser;

  const handleMockLogin = (email: string, name?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    // Deterministic UID based on email for persistence in mock mode
    const deterministicUid = 'mock_user_' + btoa(cleanEmail).replace(/=/g, '');
    const userData = {
      uid: deterministicUid,
      email: cleanEmail,
      displayName: name || 'Developer'
    };
    localStorage.setItem('mock_user', JSON.stringify(userData));
    setMockUser({
      ...userData,
      getIdToken: async () => `mock-token-${deterministicUid}`
    });
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    localStorage.removeItem('mock_user');
    setMockUser(null);
  };

  /* Temporarily disabled configuration check
  if (!isFirebaseConfigured) {
    ...
  }
  */

  const [activeBorrowers, setActiveBorrowers] = useState<Borrower[]>([]);
  const [deletedBorrowers, setDeletedBorrowers] = useState<Borrower[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reminders' | 'profile'>('dashboard');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [suggestedPaymentAmount, setSuggestedPaymentAmount] = useState<number | undefined>(undefined);
  const [showNotification, setShowNotification] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [subscription, setSubscription] = useState<Subscription>({ active: false });
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [userType, setUserType] = useState<'lender' | 'borrower' | 'loading'>('loading');
  const [borrowerData, setBorrowerData] = useState<{ borrower: any, transactions: any[] } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const urgentReminders = useMemo(() => {
    return activeBorrowers.filter(b => {
      const { balance } = calculateInterestDue(b, transactions);
      if (balance <= 0) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDateStr = b.reminder_date || b.promise_date;
      const targetDate = new Date(targetDateStr);
      targetDate.setHours(0, 0, 0, 0);
      const diffTime = targetDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Include anything due today, due tomorrow, or overdue
      return daysLeft <= 1;
    });
  }, [activeBorrowers, transactions]);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Register Service Worker for better mobile notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.error('SW registration failed:', err));
    }
  }, []);

  const triggerSystemNotification = (titleOrReminders: string | Borrower[], body?: string) => {
    if (typeof Notification !== 'undefined' && notificationPermission === 'granted') {
      let title = '';
      let notificationBody = '';

      if (Array.isArray(titleOrReminders)) {
        if (titleOrReminders.length === 0) return;
        title = titleOrReminders.length === 1 
          ? `Reminder: ${titleOrReminders[0].name}` 
          : 'Urgent Loan Reminders';
        
        notificationBody = titleOrReminders.length === 1
          ? `Payment is due for ${titleOrReminders[0].name}. Check the app for details.`
          : `You have ${titleOrReminders.length} loans due or overdue.`;
      } else {
        title = titleOrReminders;
        notificationBody = body || '';
      }
      
      // Use ServiceWorkerRegistration if available for better background support
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body: notificationBody,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: Array.isArray(titleOrReminders) ? 'loan-reminder' : 'system-alert'
          });
        });
      } else {
        new Notification(title, {
          body: notificationBody,
          icon: '/icon.svg',
          tag: Array.isArray(titleOrReminders) ? 'loan-reminder' : 'system-alert'
        });
      }
    }
  };

  useEffect(() => {
    if (urgentReminders.length > 0 && !loadingAuth && notificationPermission === 'granted') {
      setShowNotification(true);
      triggerSystemNotification(urgentReminders);

      // Auto-hide banner after 10 seconds
      const timer = setTimeout(() => setShowNotification(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [urgentReminders.length, loadingAuth, notificationPermission]);

  // Periodic check for reminders (every hour)
  useEffect(() => {
    const interval = setInterval(() => {
      if (urgentReminders.length > 0) {
        triggerSystemNotification(urgentReminders);
      }
    }, 1000 * 60 * 60); // 1 hour
    return () => clearInterval(interval);
  }, [urgentReminders]);

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    // Use token if available, otherwise just fetch
    const token = user && 'getIdToken' in user ? await (user as any).getIdToken() : 'mock-token';
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  const fetchData = async () => {
    try {
      console.log('Fetching data...');
      
      // Fetch subscription status
      const subRes = await authenticatedFetch('/api/subscription');
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }

      // First, check if the user is a borrower
      const borrowerRes = await authenticatedFetch('/api/borrower/me');
      if (borrowerRes.ok) {
        const data = await borrowerRes.json();
        setBorrowerData(data);
        setUserType('borrower');
        return; // Skip lender data fetching
      }

      const res = await authenticatedFetch('/api/dashboard');
      if (!res.ok) {
        setUserType('lender');
        return;
      }
      const data = await res.json();
      setActiveBorrowers(data.borrowers || []);
      setTransactions(data.transactions || []);
      setUserType('lender');

      const deletedRes = await authenticatedFetch('/api/deleted-borrowers');
      if (deletedRes.ok) {
        const deletedData = await deletedRes.json();
        setDeletedBorrowers(deletedData || []);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      setUserType('lender');
    }
  };

  useEffect(() => {
    fetchData();

    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [user]);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      const orderRes = await authenticatedFetch('/api/subscription/create-order', {
        method: 'POST',
        body: JSON.stringify({ 
          plan_type: plan,
          promo_code: appliedPromoCode
        })
      });
      
      if (!orderRes.ok) throw new Error('Failed to create order');
      const order = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: order.amount,
        currency: order.currency,
        name: "Kosh Finance",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
        order_id: order.id,
        handler: async (response: any) => {
          const verifyRes = await authenticatedFetch('/api/subscription/verify-payment', {
            method: 'POST',
            body: JSON.stringify({
              ...response,
              plan_type: plan
            })
          });

          if (verifyRes.ok) {
            const subData = await verifyRes.json();
            setSubscription(subData);
            setShowPaywall(false);
            setSelectedCheckoutPlan(null);
            triggerSystemNotification('Subscription Active', `Welcome to Kosh Finance Pro! Your ${plan} plan is now active.`);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.displayName || '',
          email: user?.email || '',
          contact: '', // Optional: Add if you have user's phone
        },
        readonly: {
          email: true,
          name: true
        },
        notes: {
          plan_type: plan,
          user_id: user?.uid
        },
        theme: {
          color: "#0f172a"
        },
        modal: {
          ondismiss: () => {
            console.log('Checkout closed');
          },
          escape: true,
          backdropClose: false
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handleApplyPromo = async (code: string) => {
    try {
      const res = await authenticatedFetch('/api/subscription/apply-promo', {
        method: 'POST',
        body: JSON.stringify({ promo_code: code })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.discounted) {
          setAppliedPromoCode(code);
          setPromoError('');
          triggerSystemNotification('Promo Applied!', data.message);
        } else {
          setSubscription(data);
          setShowPaywall(false);
          setAppliedPromoCode(null);
          setPromoCode('');
          setPromoError('');
          triggerSystemNotification('Promo Applied!', data.message);
        }
      } else {
        const data = await res.json();
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Promo error:', error);
      setPromoError('Failed to apply promo code');
    }
  };

  const closingRef = useRef<Set<number>>(new Set());

  // Auto-close fully paid loans
  useEffect(() => {
    const autoClosePaidLoans = async () => {
      // Find borrowers who have fully paid (balance is 0 and they have at least one transaction)
      const paidBorrowers = activeBorrowers.filter(b => {
        if (closingRef.current.has(b.id)) return false;
        const { balance } = calculateInterestDue(b, transactions);
        const hasTransactions = transactions.some(t => t.loan_id === b.loan_id);
        return hasTransactions && balance <= 0;
      });

      if (paidBorrowers.length === 0) return;

      for (const borrower of paidBorrowers) {
        closingRef.current.add(borrower.id);
        try {
          // Silent delete (move to closed)
          const res = await authenticatedFetch(`/api/borrowers/${borrower.id}`, { method: 'DELETE' });
          if (res.ok) {
            setDeletedBorrowers(prev => {
              if (prev.some(p => p.id === borrower.id)) return prev;
              return [...prev, { ...borrower, deleted_at: new Date().toISOString() }];
            });
            setActiveBorrowers(prev => prev.filter(b => b.id !== borrower.id));
            console.log(`Auto-closed fully paid loan for ${borrower.name}`);
          }
        } catch (error) {
          console.error('Auto-close error:', error);
        }
      }
    };

    autoClosePaidLoans();
  }, [activeBorrowers, transactions]);

  const metrics = useMemo(() => {
    const totalCapital = activeBorrowers.reduce((sum, b) => sum + (b.principal || 0), 0);
    const totalPending = activeBorrowers.reduce((sum, b) => sum + calculateInterestDue(b, transactions).balance, 0);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const interestThisMonth = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'interest_only';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const upcomingEMI = activeBorrowers
      .filter(b => calculateInterestDue(b, transactions).balance > 0)
      .reduce((sum, b) => sum + calculateInterestDue(b, transactions).monthlyInterest, 0);

    return { totalCapital, totalPending, interestThisMonth, upcomingEMI };
  }, [activeBorrowers, transactions]);

  const handleDelete = async (id: number) => {
    if (!subscription.active) {
      setShowPaywall(true);
      return;
    }
    if (window.confirm('Are you sure you want to move this borrower to the closed section?')) {
      try {
        // 1. Call the API first
        const res = await authenticatedFetch(`/api/borrowers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');

        // 2. Update Local State immediately for responsiveness
        const borrowerToMove = activeBorrowers.find(b => b.id === id);
        if (borrowerToMove) {
          setDeletedBorrowers(prev => {
            if (prev.some(p => p.id === id)) return prev;
            return [...prev, { ...borrowerToMove, deleted_at: new Date().toISOString() }];
          });
          setActiveBorrowers(prev => prev.filter(b => b.id !== id));
        }

        // 3. Close the modal AFTER the data is moved
        setIsDetailsModalOpen(false);
        setSelectedBorrower(null); // Clear selection
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error: Could not delete borrower.');
      }
    }
  };

  const displayBorrowers = showDeleted ? deletedBorrowers : activeBorrowers;
  const filteredBorrowers = displayBorrowers.filter(b => 
    (b.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (b.phone || '').includes(search)
  );

  const handleNotify = (borrower: Borrower) => {
    if (!subscription.active) {
      setShowPaywall(true);
      return;
    }
    const { balance } = calculateInterestDue(borrower, transactions);
    const targetDate = borrower.reminder_date || borrower.promise_date;
    const message = `Hello ${borrower.name}, your current outstanding balance for your loan (Surety: ${borrower.surety_details}) is ₹${Math.round(balance).toLocaleString('en-IN')}. Please clear it by ${targetDate}.`;
    const whatsappUrl = `https://wa.me/${borrower.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportCSV = () => {
    try {
      console.log('Exporting CSV for:', filteredBorrowers.length, 'borrowers');
      if (!filteredBorrowers || filteredBorrowers.length === 0) {
        alert("No data to export. Please make sure you have borrowers in the current list.");
        return;
      }

      const headers = [
        "Borrower Name",
        "Phone",
        "Principal",
        "Interest Rate (%)",
        "Interest Type",
        "Date Given",
        "Promise Date",
        "Surety Details",
        "Current Balance",
        "Status"
      ];

      const csvRows = filteredBorrowers.map(borrower => {
        try {
          const { balance } = calculateInterestDue(borrower, transactions);
          const status = getStatus(borrower.promise_date, balance);
          
          return [
            `"${(borrower.name || '').toString().replace(/"/g, '""')}"`,
            `"${(borrower.phone || '').toString().replace(/"/g, '""')}"`,
            borrower.principal || 0,
            borrower.interest_rate || 0,
            `"${borrower.interest_type || ''}"`,
            `"${borrower.date_given || ''}"`,
            `"${borrower.promise_date || ''}"`,
            `"${(borrower.surety_details || '').toString().replace(/"/g, '""')}"`,
            Math.round(balance || 0),
            `"${(status || '').toUpperCase()}"`
          ].join(",");
        } catch (err) {
          console.error('Error processing borrower for CSV:', borrower, err);
          return null;
        }
      }).filter(row => row !== null);

      if (csvRows.length === 0) {
        alert("No valid data to export.");
        return;
      }

      const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
      const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      const filename = `borrowers_${showDeleted ? 'closed' : 'active'}_${new Date().toISOString().split('T')[0]}.csv`;
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      console.log('CSV Export triggered successfully via Data URI');
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert("Failed to export CSV. Please check your browser's download settings or try a different browser.");
    }
  };

  if (loadingAuth && isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return (
      <div className="relative">
        <button 
          onClick={() => setShowLanding(true)}
          className="fixed top-4 left-4 z-50 p-2 text-slate-400 hover:text-slate-900 flex items-center gap-2 text-sm font-bold"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Home
        </button>
        <Login onMockLogin={handleMockLogin} />
      </div>
    );
  }

  if (userType === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (userType === 'borrower' && borrowerData) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <header className="bg-slate-900 text-white pt-8 pb-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Kosh</h1>
                <p className="text-slate-400 text-xs">Borrower Portal</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400 hidden sm:inline">{user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4 md:p-8 -mt-8">
          <BorrowerDashboard 
            borrower={borrowerData.borrower} 
            transactions={borrowerData.transactions} 
          />
        </main>
        <ChatBot context={`Borrower: ${borrowerData.borrower.name}, Principal: ₹${borrowerData.borrower.principal}, Rate: ${borrowerData.borrower.interest_rate}%, Interest Type: ${borrowerData.borrower.interest_type}, Surety: ${borrowerData.borrower.surety_details}, Promise Date: ${borrowerData.borrower.promise_date}`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Fixed Notification Bar */}
      <AnimatePresence>
        {showNotification && urgentReminders.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-600 text-white overflow-hidden sticky top-0 z-50 shadow-md"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>URGENT: {urgentReminders.length} loan{urgentReminders.length > 1 ? 's' : ''} due in 1 day or less.</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('reminders')}
                  className="underline hover:text-rose-100 transition-colors"
                >
                  View Reminders
                </button>
                <button 
                  onClick={() => setShowNotification(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-slate-900 text-white pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kosh</h1>
                <span className="px-2 py-0.5 bg-white/10 rounded-lg text-[10px] md:text-xs font-medium text-slate-400 max-w-[150px] md:max-w-none truncate">
                  {user.email}
                </span>
              </div>
              <p className="text-slate-400 text-xs md:text-sm">Private Lending & Interest Tracker</p>
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="flex items-center gap-2">
                {/* Notification Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                    className={`p-2.5 rounded-xl transition-all relative ${showNotificationDropdown ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5 md:w-6 md:h-6" />
                    {urgentReminders.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-slate-900">
                        {urgentReminders.length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotificationDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed inset-x-4 top-24 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                          <button onClick={() => setShowNotificationDropdown(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {urgentReminders.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                              <p className="text-slate-400 text-xs">No new notifications</p>
                            </div>
                          ) : (
                            urgentReminders.map(b => (
                              <div key={b.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => {
                                  setSelectedBorrower(b);
                                  setIsDetailsModalOpen(true);
                                  setShowNotificationDropdown(false);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                                    <AlertCircle className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">{b.name}</p>
                                    <p className="text-[10px] text-slate-500">Payment due: {b.reminder_date || b.promise_date}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <button 
                onClick={() => {
                  if (!subscription.active) {
                    setShowPaywall(true);
                  } else {
                    setIsAddModalOpen(true);
                  }
                }}
                className="bg-white text-slate-900 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all shadow-lg text-xs md:text-sm"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" /> 
                <span className="hidden sm:inline">New Loan Agreement</span>
                <span className="sm:hidden">New Loan</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 -mt-8">
        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 mb-6 w-full md:w-fit overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-bold transition-all text-xs md:text-sm whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 relative text-xs md:text-sm whitespace-nowrap ${activeTab === 'reminders' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell className="w-3.5 h-3.5 md:w-4 md:h-4" /> Reminders
            {urgentReminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-rose-500 text-white text-[8px] md:text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                {urgentReminders.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs md:text-sm whitespace-nowrap ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> Profile
          </button>
        </div>

        {activeTab === 'profile' ? (
          <ProfileView 
            user={user} 
            subscription={subscription} 
            onUpdate={() => {}} 
            onSubscribe={handleSubscribe}
            onApplyPromo={handleApplyPromo}
            appliedPromoCode={appliedPromoCode}
          />
        ) : activeTab === 'dashboard' ? (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          <MetricCard 
            title="Total Capital Lent" 
            value={`₹${Math.round(metrics.totalCapital).toLocaleString('en-IN')}`} 
            icon={Users} 
          />
          <MetricCard 
            title="Interest Collected" 
            value={`₹${Math.round(metrics.interestThisMonth).toLocaleString('en-IN')}`} 
            icon={TrendingUp}
            trend="+12%"
          />
          <MetricCard 
            title="Pending Recovery" 
            value={`₹${Math.round(metrics.totalPending).toLocaleString('en-IN')}`} 
            icon={Clock} 
          />
          <MetricCard 
            title="Upcoming EMI" 
            value={`₹${Math.round(metrics.upcomingEMI).toLocaleString('en-IN')}`} 
            icon={ArrowUpRight}
          />
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by borrower name or phone..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleExportCSV}
              className="flex-1 md:flex-none px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
              title="Export to CSV"
            >
              <Download className="w-5 h-5" /> <span className="md:hidden lg:inline">Export CSV</span>
            </button>
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm border ${showDeleted ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <Archive className="w-5 h-5" /> {showDeleted ? 'View Active' : 'View Closed'}
            </button>
          </div>
        </div>

        {/* Borrower Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Borrower</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loan Details</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Payment</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Due</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBorrowers.map((borrower) => {
                  const { balance, monthlyInterest } = calculateInterestDue(borrower, transactions);
                  const status = getStatus(borrower.promise_date, balance);
                  const daysSinceLastPayment = calculateDaysSinceLastPayment(borrower, transactions);
                  
                  let lastPaymentColor = 'text-emerald-600 bg-emerald-50';
                  if (daysSinceLastPayment > 60) lastPaymentColor = 'text-rose-600 bg-rose-50';
                  else if (daysSinceLastPayment > 30) lastPaymentColor = 'text-amber-600 bg-amber-50';

                  return (
                    <tr key={borrower.loan_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                            {borrower.name.charAt(0)}
                          </div>
                          <div>
                            <button 
                              onClick={() => {
                                setSelectedBorrower(borrower);
                                setIsDetailsModalOpen(true);
                              }}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                            >
                              {borrower.name}
                            </button>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {borrower.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-700">₹{Math.round(borrower.principal).toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                          {borrower.interest_rate}% {borrower.interest_type} • ₹{Math.round(monthlyInterest).toLocaleString('en-IN')}/mo
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${lastPaymentColor}`}>
                          {daysSinceLastPayment} Days Ago
                        </span>
                      </td>
                      <td className="p-4">
                        {status === 'paid' && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase">Paid</span>}
                        {status === 'on-track' && <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase">On Track</span>}
                        {status === 'due-soon' && <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full uppercase">Due Soon</span>}
                        {status === 'overdue' && <span className="px-2 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full uppercase">Overdue</span>}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ₹{Math.round(balance).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!showDeleted && (
                            <>
                              <button 
                                onClick={() => handleNotify(borrower)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Notify via WhatsApp"
                              >
                                <MessageCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedBorrower(borrower);
                                  setIsReminderModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Set EMI Reminder"
                              >
                                <Bell className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedLoanId(borrower.loan_id);
                                  setSuggestedPaymentAmount(balance);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all"
                              >
                                <IndianRupee className="w-3 h-3" /> Collect
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredBorrowers.length === 0 && (
            <div className="p-12 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No borrowers found</h3>
              <p className="text-slate-500">Try adjusting your search or add a new loan agreement.</p>
            </div>
          )}
        </div>
      </>
    ) : (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Reminders</h2>
          <p className="text-slate-500 text-sm">Track borrowers based on their promised payment dates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBorrowers
            .filter(b => {
              const { balance } = calculateInterestDue(b, transactions);
              return balance > 0;
            })
            .map(b => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const targetDateStr = b.reminder_date || b.promise_date;
              const targetDate = new Date(targetDateStr);
              targetDate.setHours(0, 0, 0, 0);
              const diffTime = targetDate.getTime() - today.getTime();
              const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const { balance } = calculateInterestDue(b, transactions);

              return { ...b, daysLeft, balance, targetDateStr };
            })
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .map(borrower => (
              <motion.div 
                key={borrower.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${
                  borrower.daysLeft < 0 ? 'border-rose-100 bg-rose-50/30' : 
                  borrower.daysLeft === 0 ? 'border-amber-100 bg-amber-50/30' : 
                  'border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{borrower.name}</h3>
                    <p className="text-xs text-slate-500">{borrower.phone}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    borrower.daysLeft < 0 ? 'bg-rose-100 text-rose-700' :
                    borrower.daysLeft === 0 ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {borrower.daysLeft < 0 ? `${Math.abs(borrower.daysLeft)} Days Overdue` : 
                     borrower.daysLeft === 0 ? 'Due Today' : 
                     `${borrower.daysLeft} Days Left`}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Pending Balance:</span>
                    <span className="font-bold text-slate-900">₹{Math.round(borrower.balance).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Promise Date:</span>
                    <span className="font-medium text-slate-700">{borrower.targetDateStr}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleNotify(borrower)}
                    className="flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </button>
                  <button 
                    onClick={() => {
                      if (!subscription.active) {
                        setShowPaywall(true);
                        return;
                      }
                      setSelectedBorrower(borrower);
                      setIsReminderModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                  >
                    <Bell className="w-3 h-3" /> Set Reminder
                  </button>
                </div>
              </motion.div>
            ))}
          
          {activeBorrowers.filter(b => calculateInterestDue(b, transactions).balance > 0).length === 0 && (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 italic">No active reminders.</p>
            </div>
          )}
        </div>
      </div>
    )}
  </main>

  {/* Modals */}
  <UpdateReminderModal 
    isOpen={isReminderModalOpen}
    onClose={() => setIsReminderModalOpen(false)}
    borrower={selectedBorrower}
    onUpdate={fetchData}
    user={user}
  />
      <AddLoanModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={fetchData} 
        user={user}
      />
      <CollectPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSuggestedPaymentAmount(undefined);
        }} 
        loanId={selectedLoanId}
        suggestedAmount={suggestedPaymentAmount}
        onAdd={fetchData} 
        user={user}
      />
      <BorrowerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        borrower={selectedBorrower}
        transactions={transactions}
        onDelete={handleDelete}
        onCollectPayment={(loanId, amount) => {
          if (!subscription.active) {
            setShowPaywall(true);
            return;
          }
          setSelectedLoanId(loanId);
          setSuggestedPaymentAmount(amount);
          setIsPaymentModalOpen(true);
          setIsDetailsModalOpen(false);
        }}
        user={user}
        subscription={subscription}
        onShowPaywall={() => setShowPaywall(true)}
      />

      {/* Paywall Overlay */}
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              onClick={() => {
                setShowPaywall(false);
                setSelectedCheckoutPlan(null);
                setAppliedPromoCode(null);
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-8 bg-slate-900 text-white text-center relative">
                <button 
                  onClick={() => {
                    setShowPaywall(false);
                    setSelectedCheckoutPlan(null);
                    setAppliedPromoCode(null);
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
                <p className="text-slate-400 text-sm mt-2">Unlock all features and manage your lending business effectively</p>
              </div>
              
              <div className="p-8">
                {!selectedCheckoutPlan ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border-2 border-slate-100 hover:border-slate-900 transition-all group">
                      <h4 className="font-bold text-slate-900">Monthly Access</h4>
                      <p className="text-3xl font-black text-slate-900 mt-2">₹99</p>
                      <p className="text-xs text-slate-500 mt-1">Valid for 30 days</p>
                      <ul className="mt-6 space-y-3">
                        <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Borrowers</li>
                        <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> WhatsApp Reminders</li>
                        <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Document Storage</li>
                      </ul>
                      <button 
                        onClick={() => setSelectedCheckoutPlan('monthly')}
                        className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                      >
                        Choose Monthly
                      </button>
                    </div>

                    <div className="p-6 rounded-2xl border-2 border-amber-500 bg-amber-50/30 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Best Value</div>
                      <h4 className="font-bold text-slate-900">Yearly Access</h4>
                      <p className="text-3xl font-black text-slate-900 mt-2">₹999</p>
                      <p className="text-xs text-slate-500 mt-1">Valid for 365 days</p>
                      <ul className="mt-6 space-y-3">
                        <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> All Pro Features</li>
                        <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority Support</li>
                        <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Save ₹189/year</li>
                      </ul>
                      <button 
                        onClick={() => setSelectedCheckoutPlan('yearly')}
                        className="w-full mt-8 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                      >
                        Choose Yearly
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Plan</p>
                        <p className="text-lg font-bold text-slate-900">{selectedCheckoutPlan === 'monthly' ? 'Monthly Access' : 'Yearly Access'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payable Amount</p>
                        <p className="text-lg font-bold text-slate-900">
                          {appliedPromoCode === 'FIRST18' ? (
                            <span className="flex flex-col items-end">
                              <span className="text-rose-500 line-through text-xs">₹{selectedCheckoutPlan === 'monthly' ? '99' : '999'}</span>
                              <span>₹18</span>
                            </span>
                          ) : (
                            `₹${selectedCheckoutPlan === 'monthly' ? '99' : '999'}`
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" /> Have a Promo Code?
                      </h4>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Enter code" 
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                          value={promoCode}
                          onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        />
                        <button 
                          onClick={() => handleApplyPromo(promoCode)}
                          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="mt-2 text-xs font-medium text-rose-600">
                          {promoError}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleSubscribe(selectedCheckoutPlan)}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl"
                      >
                        Proceed to Payment
                      </button>
                      <button 
                        onClick={() => setSelectedCheckoutPlan(null)}
                        className="w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-900 transition-all"
                      >
                        Change Plan
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-center text-[10px] text-slate-400 mt-8">
                  By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ChatBot context={activeBorrowers.length > 0 ? `Lender managing ${activeBorrowers.length} borrowers. Total Principal: ₹${activeBorrowers.reduce((sum, b) => sum + b.principal, 0)}. Borrowers list: ${activeBorrowers.map(b => b.name).join(', ')}` : 'Lender dashboard'} />
    </div>
  );
}
