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

export type LoanType = 'personal' | 'business' | 'mortgage' | 'auto' | 'student';

export type User = {
  id: string;
  email: string;
  password: string;
  role: 'customer' | 'staff';
  firstName: string;
  lastName: string;
  createdAt: string;
};

export type Document = {
  id: string;
  name: string;
  type: 'id' | 'payslip' | 'bank_statement' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
};

export type LoanOffer = {
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
};

export type TimelineStep = {
  id: string;
  stage: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  completedAt: string | null;
};

export type LoanApplication = {
  id: string;
  userId: string;
  type: LoanType;
  requestedAmount: number;
  purpose: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  employmentStatus: 'full_time' | 'part_time' | 'self_employed' | 'unemployed' | 'retired';
  annualIncome: number;
  monthlyExpenses: number;
  creditScore: number;
  existingDebts: number;
  documents: Document[];
  offer: LoanOffer | null;
  timeline: TimelineStep[];
  _monthlyEstimate?: number;
};

export type AppState = {
  currentUser: User | null;
  users: User[];
  applications: LoanApplication[];
};
