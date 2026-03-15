import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Info,
  Phone,
  MapPin,
  User,
  CreditCard,
  History,
  AlertCircle
} from 'lucide-react';

interface Transaction {
  id: number;
  loan_id: number;
  date: string;
  amount: number;
  type: 'interest_only' | 'principal_reduction' | 'full_settlement';
}

interface BorrowerData {
  id: number;
  name: string;
  phone: string;
  address: string;
  guarantor: string;
  guarantor_phone: string;
  guarantor_address: string;
  loan_id: number;
  principal: number;
  interest_rate: number;
  date_given: string;
  promise_date: string;
  reminder_date: string;
  interest_type: 'simple' | 'cumulative';
}

interface BorrowerDashboardProps {
  borrower: BorrowerData;
  transactions: Transaction[];
}

const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({ borrower, transactions }) => {
  const calculateInterestDue = () => {
    const loanTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (loanTransactions.some(t => t.type === 'full_settlement')) {
      return { balance: 0, monthlyInterest: 0, currentPrincipal: 0 };
    }

    const rate = borrower.interest_rate / 100;
    let currentPrincipal = borrower.principal;
    let totalInterestAccrued = 0;
    let lastDate = new Date(borrower.date_given);
    const now = new Date();

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
          currentPrincipal += interest;
        }
      }
      
      if (t.type === 'principal_reduction') {
        currentPrincipal -= t.amount;
      } else if (t.type === 'interest_only' && borrower.interest_type === 'cumulative') {
        currentPrincipal -= t.amount;
      }
      
      lastDate = currentDate;
    }

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

  const { balance, monthlyInterest, currentPrincipal } = calculateInterestDue();
  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate next interest payment
  const lastInterestDate = transactions
    .filter(t => t.type === 'interest_only')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || borrower.date_given;
  
  const nextInterestDate = new Date(lastInterestDate);
  nextInterestDate.setMonth(nextInterestDate.getMonth() + 1);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl">
            {borrower.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Welcome back, {borrower.name}</h2>
            <p className="text-slate-500 text-sm">Here is your loan overview and repayment status.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Balance</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{Math.round(balance).toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">Principal: ₹{Math.round(currentPrincipal).toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Repaid</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{totalPaid.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">{transactions.length} total payments</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Interest</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{Math.round(monthlyInterest).toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">Due: {nextInterestDate.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-400" /> Loan Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 text-sm">Interest Rate</span>
              <span className="font-bold text-slate-900">{borrower.interest_rate}% {borrower.interest_type}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 text-sm">Date Issued</span>
              <span className="font-bold text-slate-900">{new Date(borrower.date_given).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 text-sm">Promise Date</span>
              <span className="font-bold text-slate-900">{new Date(borrower.promise_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 text-sm">Guarantor</span>
              <span className="font-bold text-slate-900">{borrower.guarantor || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" /> Repayment History
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-slate-100 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No payments recorded yet.</p>
              </div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      t.type === 'interest_only' ? 'bg-indigo-100 text-indigo-600' : 
                      t.type === 'principal_reduction' ? 'bg-emerald-100 text-emerald-600' : 
                      'bg-amber-100 text-amber-600'
                    }`}>
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {t.type === 'interest_only' ? 'Interest Payment' : 
                         t.type === 'principal_reduction' ? 'Principal Reduction' : 
                         'Full Settlement'}
                      </p>
                      <p className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900">₹{t.amount.toLocaleString('en-IN')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold mb-1">Need assistance?</h3>
            <p className="text-slate-400 text-sm">Contact your lender for any queries regarding your loan.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${borrower.phone}`} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <Phone className="w-5 h-5" />
            </a>
            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
              Request Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDashboard;
