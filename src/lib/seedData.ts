import { AppState, LoanApplication, User } from '@/types';

function makeTimeline(status: string): any[] {
  const stages = [
    { id: 's1', stage: 'submitted', label: 'Application Submitted', description: 'Your application has been received and logged.' },
    { id: 's2', stage: 'document_review', label: 'Document Review', description: 'Our team is verifying your submitted documents.' },
    { id: 's3', stage: 'credit_check', label: 'Credit Check', description: 'We are running a soft credit assessment.' },
    { id: 's4', stage: 'compliance', label: 'Compliance & KYC', description: 'Know-Your-Customer and compliance checks in progress.' },
    { id: 's5', stage: 'offer_generated', label: 'Offer Generated', description: 'A personalised loan offer has been prepared for you.' },
    { id: 's6', stage: 'offer_accepted', label: 'Offer Accepted', description: 'You have accepted the loan offer.' },
    { id: 's7', stage: 'disbursed', label: 'Funds Disbursed', description: 'Funds have been transferred to your account.' },
  ];

  const order = ['submitted','document_review','credit_check','compliance','offer_generated','offer_accepted','disbursed'];
  const idx = order.indexOf(status);

  return stages.map((s, i) => ({
    ...s,
    completedAt: i < idx ? '2024-06-0' + (i + 1) + 'T10:00:00Z' : null,
    status: i < idx ? 'completed' : i === idx ? 'active' : 'pending',
  }));
}

export function seedData(): AppState {
  const users: User[] = [
    {
      id: 'u1',
      email: 'admin@loanflow.com',
      password: 'admin123',
      role: 'staff',
      firstName: 'Sarah',
      lastName: 'Mitchell',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'u2',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: '2024-02-10T00:00:00Z',
    },
    {
      id: 'u3',
      email: 'emma@example.com',
      password: 'password123',
      role: 'customer',
      firstName: 'Emma',
      lastName: 'Wilson',
      createdAt: '2024-03-05T00:00:00Z',
    },
  ];

  const applications: LoanApplication[] = [
    {
      id: 'app1',
      userId: 'u2',
      type: 'personal',
      requestedAmount: 15000,
      purpose: 'Home renovation',
      status: 'credit_check',
      createdAt: '2024-06-01T09:00:00Z',
      updatedAt: '2024-06-03T14:00:00Z',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-0101',
      dateOfBirth: '1988-03-15',
      address: '123 Maple St, Springfield, IL',
      employmentStatus: 'full_time',
      annualIncome: 72000,
      monthlyExpenses: 2200,
      creditScore: 720,
      existingDebts: 5000,
      documents: [
        { id: 'd1', name: 'National_ID.pdf', type: 'id', status: 'approved', uploadedAt: '2024-06-01T10:00:00Z' },
        { id: 'd2', name: 'Payslip_May2024.pdf', type: 'payslip', status: 'approved', uploadedAt: '2024-06-01T10:05:00Z' },
        { id: 'd3', name: 'Bank_Statement_3mo.pdf', type: 'bank_statement', status: 'pending', uploadedAt: '2024-06-01T10:10:00Z' },
      ],
      offer: null,
      timeline: makeTimeline('credit_check'),
    },
    {
      id: 'app2',
      userId: 'u3',
      type: 'business',
      requestedAmount: 50000,
      purpose: 'Business expansion',
      status: 'offer_generated',
      createdAt: '2024-05-15T08:00:00Z',
      updatedAt: '2024-06-05T11:00:00Z',
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma@example.com',
      phone: '+1-555-0202',
      dateOfBirth: '1985-07-22',
      address: '456 Oak Ave, Chicago, IL',
      employmentStatus: 'self_employed',
      annualIncome: 120000,
      monthlyExpenses: 4500,
      creditScore: 760,
      existingDebts: 12000,
      documents: [
        { id: 'd4', name: 'Passport.pdf', type: 'id', status: 'approved', uploadedAt: '2024-05-15T09:00:00Z' },
        { id: 'd5', name: 'Business_Financials.pdf', type: 'payslip', status: 'approved', uploadedAt: '2024-05-15T09:05:00Z' },
        { id: 'd6', name: 'Bank_Statement_6mo.pdf', type: 'bank_statement', status: 'approved', uploadedAt: '2024-05-15T09:10:00Z' },
      ],
      offer: {
        id: 'off1',
        applicationId: 'app2',
        amount: 48000,
        interestRate: 7.5,
        termMonths: 60,
        monthlyPayment: 963,
        totalRepayable: 57780,
        generatedAt: '2024-06-05T11:00:00Z',
        expiresAt: '2024-07-05T11:00:00Z',
        customizedByStaff: true,
        status: 'pending',
      },
      timeline: makeTimeline('offer_generated'),
    },
  ];

  return {
    currentUser: null,
    users,
    applications,
  };
}
