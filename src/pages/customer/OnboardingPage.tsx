import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/context';
import { generateId, calculateMonthlyPayment } from '@/lib/utils';
import { LoanApplication, LoanType, TimelineStep } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Loan Details' },
  { id: 2, label: 'Personal Info' },
  { id: 3, label: 'Financial Info' },
  { id: 4, label: 'Documents' },
  { id: 5, label: 'Review' },
];

function makeTimeline(): TimelineStep[] {
  const stages: { id: string; stage: string; label: string; description: string }[] = [
    { id: 's1', stage: 'submitted', label: 'Application Submitted', description: 'Your application has been received and logged.' },
    { id: 's2', stage: 'document_review', label: 'Document Review', description: 'Our team is verifying your submitted documents.' },
    { id: 's3', stage: 'credit_check', label: 'Credit Check', description: 'We are running a soft credit assessment.' },
    { id: 's4', stage: 'compliance', label: 'Compliance & KYC', description: 'Know-Your-Customer and compliance checks in progress.' },
    { id: 's5', stage: 'offer_generated', label: 'Offer Generated', description: 'A personalised loan offer has been prepared for you.' },
    { id: 's6', stage: 'offer_accepted', label: 'Offer Accepted', description: 'You have accepted the loan offer.' },
    { id: 's7', stage: 'disbursed', label: 'Funds Disbursed', description: 'Funds have been transferred to your account.' },
  ];
  return stages.map((s, i) => ({
    ...s,
    completedAt: null,
    status: i === 0 ? 'active' : 'pending',
  })) as TimelineStep[];
}

type FormData = {
  // Step 1
  loanType: LoanType;
  requestedAmount: string;
  termMonths: string;
  purpose: string;
  // Step 2
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  // Step 3
  employmentStatus: string;
  annualIncome: string;
  monthlyExpenses: string;
  creditScore: string;
  existingDebts: string;
  // Step 4 (simulated)
  hasId: boolean;
  hasPayslip: boolean;
  hasBankStatement: boolean;
};

const defaultForm: FormData = {
  loanType: 'personal',
  requestedAmount: '',
  termMonths: '36',
  purpose: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  employmentStatus: 'full_time',
  annualIncome: '',
  monthlyExpenses: '',
  creditScore: '',
  existingDebts: '0',
  hasId: false,
  hasPayslip: false,
  hasBankStatement: false,
};

export default function OnboardingPage() {
  const { state, submitApplication } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const user = state.currentUser!;

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const principal = parseFloat(form.requestedAmount) || 0;
  const rate = 8.5; // default rate for preview
  const months = parseInt(form.termMonths) || 36;
  const estimatedMonthly = principal > 0 ? calculateMonthlyPayment(principal, rate, months) : 0;

  const validateStep = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === 1) {
      if (!form.requestedAmount || parseFloat(form.requestedAmount) < 1000) errs.requestedAmount = 'Minimum loan amount is $1,000';
      if (!form.purpose.trim()) errs.purpose = 'Purpose is required';
    }
    if (step === 2) {
      if (!form.firstName.trim()) errs.firstName = 'Required';
      if (!form.lastName.trim()) errs.lastName = 'Required';
      if (!form.email.trim()) errs.email = 'Required';
      if (!form.phone.trim()) errs.phone = 'Required';
      if (!form.dateOfBirth) errs.dateOfBirth = 'Required';
      if (!form.address.trim()) errs.address = 'Required';
    }
    if (step === 3) {
      if (!form.annualIncome || parseFloat(form.annualIncome) < 1) errs.annualIncome = 'Required';
      if (!form.monthlyExpenses || parseFloat(form.monthlyExpenses) < 0) errs.monthlyExpenses = 'Required';
      if (!form.creditScore || parseInt(form.creditScore) < 300 || parseInt(form.creditScore) > 850) errs.creditScore = 'Enter a score between 300-850';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const docs = [
      form.hasId && { id: generateId(), name: 'Government_ID.pdf', type: 'id' as const, status: 'pending' as const, uploadedAt: new Date().toISOString() },
      form.hasPayslip && { id: generateId(), name: 'Recent_Payslip.pdf', type: 'payslip' as const, status: 'pending' as const, uploadedAt: new Date().toISOString() },
      form.hasBankStatement && { id: generateId(), name: 'Bank_Statement.pdf', type: 'bank_statement' as const, status: 'pending' as const, uploadedAt: new Date().toISOString() },
    ].filter(Boolean) as LoanApplication['documents'];

    const app: LoanApplication = {
      id: generateId(),
      userId: user.id,
      type: form.loanType,
      requestedAmount: parseFloat(form.requestedAmount),
      purpose: form.purpose,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      address: form.address,
      employmentStatus: form.employmentStatus as LoanApplication['employmentStatus'],
      annualIncome: parseFloat(form.annualIncome),
      monthlyExpenses: parseFloat(form.monthlyExpenses),
      creditScore: parseInt(form.creditScore),
      existingDebts: parseFloat(form.existingDebts) || 0,
      documents: docs,
      offer: null,
      timeline: makeTimeline(),
    };

    submitApplication(app);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">Your loan application has been received. We'll review it and get back to you shortly.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/app/applications')}>View Applications</Button>
            <Button onClick={() => { setSubmitted(false); setStep(1); setForm(defaultForm); }}>Apply Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Apply for a Loan</h1>
        <p className="text-gray-500 text-sm mt-1">Complete all steps to submit your application</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step > s.id ? 'bg-green-500 text-white' :
                step === s.id ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                step === s.id ? 'text-blue-600' : 'text-gray-400'
              }`}>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${
                step > s.id ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="card">
        {/* Step 1: Loan Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Loan Details</h2>
            <Select
              label="Loan Type"
              value={form.loanType}
              onChange={set('loanType')}
              options={[
                { value: 'personal', label: 'Personal Loan' },
                { value: 'business', label: 'Business Loan' },
                { value: 'mortgage', label: 'Mortgage' },
                { value: 'auto', label: 'Auto Loan' },
                { value: 'student', label: 'Student Loan' },
              ]}
            />
            <Input
              label="Requested Amount ($)"
              type="number"
              min="1000"
              value={form.requestedAmount}
              onChange={set('requestedAmount')}
              placeholder="e.g. 15000"
              error={errors.requestedAmount}
            />
            <Select
              label="Loan Term"
              value={form.termMonths}
              onChange={set('termMonths')}
              options={[
                { value: '12', label: '12 months (1 year)' },
                { value: '24', label: '24 months (2 years)' },
                { value: '36', label: '36 months (3 years)' },
                { value: '48', label: '48 months (4 years)' },
                { value: '60', label: '60 months (5 years)' },
                { value: '84', label: '84 months (7 years)' },
                { value: '120', label: '120 months (10 years)' },
              ]}
            />
            <div>
              <label className="text-sm font-medium text-gray-700">Purpose</label>
              <textarea
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={form.purpose}
                onChange={set('purpose')}
                placeholder="Describe the purpose of this loan..."
              />
              {errors.purpose && <p className="text-xs text-red-600">{errors.purpose}</p>}
            </div>
            {principal > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-blue-800">Estimated Monthly Payment</p>
                <p className="text-2xl font-bold text-blue-600">${estimatedMonthly.toLocaleString()}</p>
                <p className="text-xs text-blue-500 mt-1">Based on {rate}% p.a. indicative rate over {months} months</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Personal Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
              <Input label="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
            </div>
            <Input label="Email Address" type="email" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} error={errors.dateOfBirth} />
            <Input label="Home Address" value={form.address} onChange={set('address')} error={errors.address} />
          </div>
        )}

        {/* Step 3: Financial Info */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Financial Information</h2>
            <Select
              label="Employment Status"
              value={form.employmentStatus}
              onChange={set('employmentStatus')}
              options={[
                { value: 'full_time', label: 'Full-time employed' },
                { value: 'part_time', label: 'Part-time employed' },
                { value: 'self_employed', label: 'Self-employed' },
                { value: 'unemployed', label: 'Unemployed' },
                { value: 'retired', label: 'Retired' },
              ]}
            />
            <Input
              label="Annual Income ($)"
              type="number"
              value={form.annualIncome}
              onChange={set('annualIncome')}
              error={errors.annualIncome}
              placeholder="e.g. 60000"
            />
            <Input
              label="Monthly Expenses ($)"
              type="number"
              value={form.monthlyExpenses}
              onChange={set('monthlyExpenses')}
              error={errors.monthlyExpenses}
              placeholder="e.g. 2000"
            />
            <Input
              label="Credit Score (300–850)"
              type="number"
              min="300"
              max="850"
              value={form.creditScore}
              onChange={set('creditScore')}
              error={errors.creditScore}
              placeholder="e.g. 720"
            />
            <Input
              label="Existing Debts ($)"
              type="number"
              value={form.existingDebts}
              onChange={set('existingDebts')}
              placeholder="0"
            />
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Upload Documents</h2>
            <p className="text-sm text-gray-500">Tick the documents you have ready to submit. (Simulated uploads)</p>
            {[
              { field: 'hasId' as keyof FormData, label: 'Government-issued ID', hint: 'Passport, driver\'s license, or national ID' },
              { field: 'hasPayslip' as keyof FormData, label: 'Recent Payslip', hint: 'Last 1–3 months' },
              { field: 'hasBankStatement' as keyof FormData, label: 'Bank Statement', hint: 'Last 3–6 months' },
            ].map(doc => (
              <label key={doc.field} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form[doc.field] as boolean}
                  onChange={set(doc.field)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.label}</p>
                  <p className="text-xs text-gray-500">{doc.hint}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Review & Submit</h2>
            <div className="space-y-3">
              {[
                { label: 'Loan Type', value: form.loanType },
                { label: 'Amount', value: `$${parseFloat(form.requestedAmount || '0').toLocaleString()}` },
                { label: 'Term', value: `${form.termMonths} months` },
                { label: 'Purpose', value: form.purpose },
                { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                { label: 'Email', value: form.email },
                { label: 'Annual Income', value: `$${parseFloat(form.annualIncome || '0').toLocaleString()}` },
                { label: 'Credit Score', value: form.creditScore },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">By submitting, you confirm that all information provided is accurate and consent to a soft credit check.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={back} disabled={step === 1}>
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        {step < STEPS.length ? (
          <Button onClick={next}>
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
}
