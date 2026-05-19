import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { generateId, calculateMonthlyPayment } from '@/lib/utils';
import { LoanApplication, TimelineStep, LoanType } from '@/types';
import { CheckCircle, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

const STEPS = [
  { id: 1, label: 'Loan Details', description: 'Choose loan type and amount' },
  { id: 2, label: 'Personal Info', description: 'Your personal details' },
  { id: 3, label: 'Financial Info', description: 'Your financial situation' },
  { id: 4, label: 'Documents', description: 'Upload required documents' },
  { id: 5, label: 'Review', description: 'Review and submit' },
];

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'student', label: 'Student Loan' },
];

const EMPLOYMENT = [
  { value: 'full_time', label: 'Full-time Employed' },
  { value: 'part_time', label: 'Part-time Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
];

function makeInitialTimeline(): TimelineStep[] {
  return [
    { id: 's1', stage: 'submitted', label: 'Application Submitted', description: 'Your application has been received.', completedAt: new Date().toISOString(), status: 'completed' },
    { id: 's2', stage: 'document_review', label: 'Document Review', description: 'Our team is verifying your submitted documents.', completedAt: null, status: 'active' },
    { id: 's3', stage: 'credit_check', label: 'Credit Check', description: 'We are running a soft credit assessment.', completedAt: null, status: 'pending' },
    { id: 's4', stage: 'compliance', label: 'Compliance & KYC', description: 'Know-Your-Customer and compliance checks.', completedAt: null, status: 'pending' },
    { id: 's5', stage: 'offer_generated', label: 'Offer Generated', description: 'A personalised loan offer will be prepared.', completedAt: null, status: 'pending' },
    { id: 's6', stage: 'offer_accepted', label: 'Offer Accepted', description: 'You accept the loan offer.', completedAt: null, status: 'pending' },
    { id: 's7', stage: 'disbursed', label: 'Funds Disbursed', description: 'Funds transferred to your account.', completedAt: null, status: 'pending' },
  ];
}

export default function OnboardingPage() {
  const { state, submitApplication } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser;
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    type: 'personal' as LoanType,
    requestedAmount: '',
    purpose: '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    address: '',
    employmentStatus: 'full_time',
    annualIncome: '',
    monthlyExpenses: '',
    creditScore: '',
    existingDebts: '',
    docId: '',
    docPayslip: '',
    docBank: '',
  });

  const set = (field: string) => (e: any) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    const amount = parseFloat(form.requestedAmount) || 0;
    const rate = 8.5;
    const months = 60;
    const monthly = calculateMonthlyPayment(amount, rate, months);

    const app: LoanApplication = {
      id: generateId(),
      userId: user?.id || '',
      type: form.type,
      requestedAmount: amount,
      purpose: form.purpose,
      status: 'document_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      address: form.address,
      employmentStatus: form.employmentStatus,
      annualIncome: parseFloat(form.annualIncome) || 0,
      monthlyExpenses: parseFloat(form.monthlyExpenses) || 0,
      creditScore: parseInt(form.creditScore) || 0,
      existingDebts: parseFloat(form.existingDebts) || 0,
      documents: [
        form.docId && { id: generateId(), name: form.docId, type: 'id' as const, status: 'pending' as const, uploadedAt: new Date().toISOString() },
        form.docPayslip && { id: generateId(), name: form.docPayslip, type: 'payslip' as const, status: 'pending' as const, uploadedAt: new Date().toISOString() },
        form.docBank && { id: generateId(), name: form.docBank, type: 'bank_statement' as const, status: 'pending' as const, uploadedAt: new Date().toISOString() },
      ].filter(Boolean) as any,
      offer: null,
      timeline: makeInitialTimeline(),
    };

    submitApplication(app);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">We've received your application and will begin processing it shortly. You can track progress in the applications section.</p>
          <Button onClick={() => navigate('/app/applications')}>
            View My Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Apply for a Loan</h1>
        <p className="text-gray-500 text-sm mt-1">Complete the steps below to submit your application</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                step > s.id ? 'bg-green-500 text-white' :
                step === s.id ? 'bg-blue-600 text-white' :
                'bg-gray-100 text-gray-400'
              )}>
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              <div className="hidden sm:block">
                <p className={clsx('text-xs font-semibold', step === s.id ? 'text-blue-700' : step > s.id ? 'text-green-600' : 'text-gray-400')}>{s.label}</p>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={clsx('w-8 sm:w-12 h-0.5 mx-2', step > s.id ? 'bg-green-400' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      <div className="card">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Loan Details</h2>
            <Select
              label="Loan Type"
              options={LOAN_TYPES}
              value={form.type}
              onChange={(e: any) => setForm(prev => ({ ...prev, type: e.target.value as LoanType }))}
            />
            <Input
              label="Requested Amount ($)"
              type="number"
              value={form.requestedAmount}
              onChange={set('requestedAmount')}
              placeholder="e.g. 25000"
              min="1000"
            />
            <Input
              label="Purpose of Loan"
              value={form.purpose}
              onChange={set('purpose')}
              placeholder="e.g. Home renovation, business expansion..."
            />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.firstName} onChange={set('firstName')} />
              <Input label="Last Name" value={form.lastName} onChange={set('lastName')} />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={set('email')} />
            <Input label="Phone Number" value={form.phone} onChange={set('phone')} placeholder="+1-555-0100" />
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            <Input label="Residential Address" value={form.address} onChange={set('address')} placeholder="123 Main St, City, State" />
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Financial Information</h2>
            <Select label="Employment Status" options={EMPLOYMENT} value={form.employmentStatus} onChange={set('employmentStatus')} />
            <Input label="Annual Income ($)" type="number" value={form.annualIncome} onChange={set('annualIncome')} placeholder="e.g. 60000" />
            <Input label="Monthly Expenses ($)" type="number" value={form.monthlyExpenses} onChange={set('monthlyExpenses')} placeholder="e.g. 2000" />
            <Input label="Credit Score" type="number" value={form.creditScore} onChange={set('creditScore')} placeholder="300–850" min="300" max="850" />
            <Input label="Existing Debts ($)" type="number" value={form.existingDebts} onChange={set('existingDebts')} placeholder="e.g. 5000" />
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Document Upload</h2>
            <p className="text-sm text-gray-500">Enter filenames below to simulate document uploads.</p>
            <div className="space-y-3">
              {[
                { field: 'docId', label: 'Government ID (Passport / National ID)', placeholder: 'e.g. passport.pdf' },
                { field: 'docPayslip', label: 'Recent Payslip (last 3 months)', placeholder: 'e.g. payslip_june.pdf' },
                { field: 'docBank', label: 'Bank Statements (last 3–6 months)', placeholder: 'e.g. bank_statement.pdf' },
              ].map(doc => (
                <div key={doc.field} className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{doc.label}</p>
                    <input
                      className="mt-1 text-sm border border-gray-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder={doc.placeholder}
                      value={(form as any)[doc.field]}
                      onChange={set(doc.field)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Loan Type', value: form.type },
                { label: 'Requested Amount', value: `$${form.requestedAmount}` },
                { label: 'Purpose', value: form.purpose },
                { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                { label: 'Email', value: form.email },
                { label: 'Phone', value: form.phone },
                { label: 'Employment', value: form.employmentStatus },
                { label: 'Annual Income', value: `$${form.annualIncome}` },
                { label: 'Credit Score', value: form.creditScore },
              ].map(item => (
                <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700 font-medium">By submitting, you confirm all provided information is accurate and consent to a soft credit check.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length ? (
            <Button onClick={() => setStep(s => Math.min(STEPS.length, s + 1))}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <CheckCircle className="w-4 h-4" /> Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
