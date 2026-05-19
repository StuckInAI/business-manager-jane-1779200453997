export type UserRole = 'customer' | 'staff';

export type LoanStatus =
  | 'draft'
  | 'submitted'
  | 'document_review'
  | 'credit_check'
  | 'compliance'
  | 'offer_generated'
  | 'offer_accepted'
  | 'disbursed'
  | 'rejected';

export type LoanType =
  | 'personal'
  | 'business'
  | 'mortgage'
  | 'auto'
  | 'student';

export interface Document {
  id: string;
  name: string;
  type: 'id' | 'payslip' | 'bank_statement' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

export interface LoanOffer {
  id: string;
  applicationId: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalRepayable: number;
  generatedAt: string;
  expiresAt: string;
  customizedByStaff: boolean;
  status: 'pending' | 'accepted' | 'declined';
}

export interface TimelineStep {
  id: string;
  stage: LoanStatus;
  label: string;
  description: string;
  completedAt: string | null;
  status: 'completed' | 'active' | 'pending';
}

export interface LoanApplication {
  id: string;
  userId: string;
  type: LoanType;
  requestedAmount: number;
  purpose: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  offer: LoanOffer | null;
  timeline: TimelineStep[];
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  // Financial info
  employmentStatus: string;
  annualIncome: number;
  monthlyExpenses: number;
  creditScore: number;
  existingDebts: number;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  applications: LoanApplication[];
}
