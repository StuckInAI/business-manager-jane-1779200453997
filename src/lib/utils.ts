import { LoanStatus, LoanType } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function loanStatusLabel(status: LoanStatus): string {
  const map: Record<LoanStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    document_review: 'Document Review',
    credit_check: 'Credit Check',
    compliance: 'Compliance',
    offer_generated: 'Offer Ready',
    offer_accepted: 'Offer Accepted',
    disbursed: 'Disbursed',
    rejected: 'Rejected',
  };
  return map[status] || status;
}

export function loanStatusColor(status: LoanStatus): string {
  const map: Record<LoanStatus, string> = {
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-700',
    document_review: 'bg-yellow-100 text-yellow-700',
    credit_check: 'bg-orange-100 text-orange-700',
    compliance: 'bg-purple-100 text-purple-700',
    offer_generated: 'bg-green-100 text-green-700',
    offer_accepted: 'bg-emerald-100 text-emerald-700',
    disbursed: 'bg-teal-100 text-teal-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

export function loanTypeLabel(type: LoanType): string {
  const map: Record<LoanType, string> = {
    personal: 'Personal Loan',
    business: 'Business Loan',
    mortgage: 'Mortgage',
    auto: 'Auto Loan',
    student: 'Student Loan',
  };
  return map[type] || type;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}
