import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/context';
import { LoanApplication, LoanType, Document } from '@/types';
import { generateId, calculateMonthlyPayment } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { CheckCircle, Upload, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = ['Loan Details', 'Personal Info', 'Financial Info', 'Documents', 'Review'];

function makeTimeline(status: string) {
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
    completedAt: i < idx ? new Date().toISOString() : null,
    status: i < idx ? 'completed' : i === idx ? 'active' : 'pending',
  }));
}

export default function OnboardingPage() {
  const { state, submitApplication } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [loanType, setLoanType] = useState<LoanType>('personal');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [termMonths, setTermMonths] = useState('36');

  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  const [employmentStatus, setEmploymentStatus] = useState('full_time');
  const [annualIncome, setAnnualIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [existingDebts, setExistingDebts] = useState('');

  const [docs, setDocs] = useState<Document[]>([]);

  const addFakeDoc = (type: Document['type'], name: string) => {
    const doc: Document = {
      id: generateId(),
      name,
      type,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
    };
    setDocs(prev => [...prev.filter(d => d.type !== type), doc]);
  };

  const handleSubmit = () => {
    const rate = 8.5;
    const months = parseInt(termMonths);
    const principal = parseFloat(amount);
    const monthly = calculateMonthlyPayment(principal, rate, months);

    const app: LoanApplication = {
      id: generateId(),
      userId: user.id,
      type: loanType,
      requestedAmount: principal,
      purpose,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone,
      dateOfBirth: dob,
      address,
      employmentStatus: employmentStatus as LoanApplication['employmentStatus'],
      annualIncome: parseFloat(annualIncome),
      monthlyExpenses: parseFloat(monthlyExpenses),
      creditScore: parseInt(creditScore),
      existingDebts: parseFloat(existingDebts || '0'),
      documents: docs,
      offer: null,
      timeline: makeTimeline('submitted') as any,
      _monthlyEstimate: monthly,
    };
    submitApplication(app);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">Your loan application has been received. Our team will review it shortly.</p>
          <Button onClick={() => navigate('/app/applications')}>View My Applications</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Apply for a Loan</h1>
        <p className="text-gray-500 text-sm mt-1">Complete the form below to submit your application.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              i === step ? 'bg-blue-600 text-white' :
              i < step ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? <CheckCircle className="w-3 h-3" /> : <span>{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="card">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Loan Details</h2>
            <Select
              label="Loan Type"
              value={loanType}
              onChange={e => setLoanType(e.target.value as LoanType)}
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
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 20000"
              min="1000"
            />
            <Input
              label="Purpose"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="e.g. Home renovation"
            />
            <Select
              label="Loan Term"
              value={termMonths}
              onChange={e => setTermMonths(e.target.value)}
              options={[
                { value: '12', label: '12 months' },
                { value: '24', label: '24 months' },
                { value: '36', label: '36 months' },
                { value: '48', label: '48 months' },
                { value: '60', label: '60 months' },
              ]}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={user.firstName} disabled />
              <Input label="Last Name" value={user.lastName} disabled />
            </div>
            <Input label="Email" type="email" value={user.email} disabled />
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1-555-0000"
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
            />
            <Input
              label="Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main St, City, State"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Financial Information</h2>
            <Select
              label="Employment Status"
              value={employmentStatus}
              onChange={e => setEmploymentStatus(e.target.value)}
              options={[
                { value: 'full_time', label: 'Full-time Employed' },
                { value: 'part_time', label: 'Part-time Employed' },
                { value: 'self_employed', label: 'Self-employed' },
                { value: 'unemployed', label: 'Unemployed' },
                { value: 'retired', label: 'Retired' },
              ]}
            />
            <Input
              label="Annual Income ($)"
              type="number"
              value={annualIncome}
              onChange={e => setAnnualIncome(e.target.value)}
              placeholder="e.g. 60000"
            />
            <Input
              label="Monthly Expenses ($)"
              type="number"
              value={monthlyExpenses}
              onChange={e => setMonthlyExpenses(e.target.value)}
              placeholder="e.g. 2000"
            />
            <Input
              label="Credit Score"
              type="number"
              value={creditScore}
              onChange={e => setCreditScore(e.target.value)}
              placeholder="300 – 850"
              min="300"
              max="850"
            />
            <Input
              label="Existing Debts ($)"
              type="number"
              value={existingDebts}
              onChange={e => setExistingDebts(e.target.value)}
              placeholder="e.g. 5000"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Upload Documents</h2>
            <p className="text-sm text-gray-500">Click to simulate uploading each document.</p>
            {[
              { type: 'id' as Document['type'], label: 'Government-issued ID', hint: 'Passport, Driver's license, etc.' },
              { type: 'payslip' as Document['type'], label: 'Recent Payslip / Income Proof', hint: 'Last 1–3 months' },
              { type: 'bank_statement' as Document['type'], label: 'Bank Statement', hint: 'Last 3–6 months' },
            ].map(item => {
              const uploaded = docs.find(d => d.type === item.type);
              return (
                <div key={item.type} className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.hint}</p>
                    {uploaded && <p className="text-xs text-green-600 mt-1">✓ {uploaded.name}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => addFakeDoc(item.type, `${item.label.replace(/[^a-zA-Z]/g, '_')}.pdf`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploaded ? 'Re-upload' : 'Upload'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Review & Submit</h2>
            <div className="space-y-3">
              {[
                { label: 'Loan Type', value: loanType },
                { label: 'Amount', value: `$${parseFloat(amount || '0').toLocaleString()}` },
                { label: 'Purpose', value: purpose },
                { label: 'Term', value: `${termMonths} months` },
                { label: 'Employment', value: employmentStatus.replace('_', ' ') },
                { label: 'Annual Income', value: `$${parseFloat(annualIncome || '0').toLocaleString()}` },
                { label: 'Documents', value: `${docs.length} uploaded` },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-900 capitalize">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              By submitting, you agree to our terms and consent to a soft credit check.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)}>
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
