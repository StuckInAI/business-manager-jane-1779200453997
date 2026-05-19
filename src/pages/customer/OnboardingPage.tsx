import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/context';
import { LoanApplication, Document } from '@/types';
import { generateId, calculateMonthlyPayment } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { CheckCircle, Upload, ChevronRight, ChevronLeft } from 'lucide-react';

type Step = 'personal' | 'loan' | 'documents' | 'review';

const STEPS: { id: Step; label: string }[] = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'loan', label: 'Loan Details' },
  { id: 'documents', label: 'Documents' },
  { id: 'review', label: 'Review' },
];

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  employmentStatus: string;
  annualIncome: string;
  monthlyExpenses: string;
  creditScore: string;
  existingDebts: string;
  loanType: string;
  requestedAmount: string;
  termMonths: string;
  purpose: string;
};

const initialForm: FormData = {
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
  existingDebts: '',
  loanType: 'personal',
  requestedAmount: '',
  termMonths: '36',
  purpose: '',
};

export default function OnboardingPage() {
  const { state, submitApplication } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;

  const [step, setStep] = useState<Step>('personal');
  const [form, setForm] = useState<FormData>({
    ...initialForm,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const validatePersonal = () => {
    const errs: Partial<FormData> = {};
    if (!form.firstName) errs.firstName = 'Required';
    if (!form.lastName) errs.lastName = 'Required';
    if (!form.email) errs.email = 'Required';
    if (!form.phone) errs.phone = 'Required';
    if (!form.dateOfBirth) errs.dateOfBirth = 'Required';
    if (!form.address) errs.address = 'Required';
    if (!form.annualIncome) errs.annualIncome = 'Required';
    if (!form.monthlyExpenses) errs.monthlyExpenses = 'Required';
    if (!form.creditScore) errs.creditScore = 'Required';
    return errs;
  };

  const validateLoan = () => {
    const errs: Partial<FormData> = {};
    if (!form.requestedAmount) errs.requestedAmount = 'Required';
    if (!form.purpose) errs.purpose = 'Required';
    return errs;
  };

  const next = () => {
    if (step === 'personal') {
      const errs = validatePersonal();
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }
    if (step === 'loan') {
      const errs = validateLoan();
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }
    setErrors({});
    const idx = STEPS.findIndex(s => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };

  const back = () => {
    const idx = STEPS.findIndex(s => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const handleDocUpload = (type: Document['type'], fileName: string) => {
    const existing = documents.find(d => d.type === type);
    if (existing) {
      setDocuments(prev => prev.map(d => d.type === type ? { ...d, name: fileName } : d));
    } else {
      const doc: Document = {
        id: generateId(),
        name: fileName,
        type,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
      };
      setDocuments(prev => [...prev, doc]);
    }
  };

  const handleSubmit = () => {
    const principal = parseFloat(form.requestedAmount);
    const months = parseInt(form.termMonths);
    const rate = 8.5;
    const monthly = calculateMonthlyPayment(principal, rate, months);

    const timeline = [
      { id: generateId(), stage: 'submitted', label: 'Application Submitted', description: 'Your application has been received.', status: 'active', completedAt: null },
      { id: generateId(), stage: 'document_review', label: 'Document Review', description: 'Our team will verify your documents.', status: 'pending', completedAt: null },
      { id: generateId(), stage: 'credit_check', label: 'Credit Check', description: 'Soft credit assessment in progress.', status: 'pending', completedAt: null },
      { id: generateId(), stage: 'compliance', label: 'Compliance & KYC', description: 'Know-Your-Customer checks.', status: 'pending', completedAt: null },
      { id: generateId(), stage: 'offer_generated', label: 'Offer Generated', description: 'A personalised offer will be prepared.', status: 'pending', completedAt: null },
      { id: generateId(), stage: 'offer_accepted', label: 'Offer Accepted', description: 'You accept the loan offer.', status: 'pending', completedAt: null },
      { id: generateId(), stage: 'disbursed', label: 'Funds Disbursed', description: 'Funds transferred to your account.', status: 'pending', completedAt: null },
    ] as any;

    const app: LoanApplication = {
      id: generateId(),
      userId: user.id,
      type: form.loanType as LoanApplication['type'],
      requestedAmount: principal,
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
      existingDebts: parseFloat(form.existingDebts || '0'),
      documents,
      offer: null,
      timeline,
    };

    submitApplication(app);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">Your loan application has been received. We'll review it and get back to you soon.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/app/applications')}>View Applications</Button>
            <Button onClick={() => navigate('/app')}>Back to Dashboard</Button>
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

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${
              i <= stepIndex ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i < stepIndex ? 'bg-blue-600 border-blue-600 text-white' :
                i === stepIndex ? 'border-blue-600 text-blue-600 bg-white' :
                'border-gray-300 text-gray-400 bg-white'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${
                i < stepIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="card">
        {step === 'personal' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} required />
              <Input label="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} required />
            </div>
            <Input label="Email Address" type="email" value={form.email} onChange={set('email')} error={errors.email} required />
            <Input label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+1-555-0000" required />
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} error={errors.dateOfBirth} required />
            <Input label="Address" value={form.address} onChange={set('address')} error={errors.address} placeholder="123 Main St, City, State" required />
            <Select
              label="Employment Status"
              value={form.employmentStatus}
              onChange={set('employmentStatus')}
              options={[
                { value: 'full_time', label: 'Full-time Employed' },
                { value: 'part_time', label: 'Part-time Employed' },
                { value: 'self_employed', label: 'Self-employed' },
                { value: 'unemployed', label: 'Unemployed' },
                { value: 'retired', label: 'Retired' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Annual Income ($)" type="number" value={form.annualIncome} onChange={set('annualIncome')} error={errors.annualIncome} placeholder="60000" required />
              <Input label="Monthly Expenses ($)" type="number" value={form.monthlyExpenses} onChange={set('monthlyExpenses')} error={errors.monthlyExpenses} placeholder="2000" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Credit Score" type="number" value={form.creditScore} onChange={set('creditScore')} error={errors.creditScore} placeholder="700" required />
              <Input label="Existing Debts ($)" type="number" value={form.existingDebts} onChange={set('existingDebts')} placeholder="0" />
            </div>
          </div>
        )}

        {step === 'loan' && (
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
              value={form.requestedAmount}
              onChange={set('requestedAmount')}
              error={errors.requestedAmount}
              placeholder="10000"
              required
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
              ]}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Purpose of Loan</label>
              <textarea
                value={form.purpose}
                onChange={set('purpose')}
                rows={3}
                placeholder="Describe what you intend to use the loan for..."
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {errors.purpose && <p className="text-xs text-red-600">{errors.purpose}</p>}
            </div>
            {form.requestedAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-800 mb-1">Estimated Monthly Payment</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${calculateMonthlyPayment(parseFloat(form.requestedAmount), 8.5, parseInt(form.termMonths)).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">Based on indicative 8.5% p.a. rate over {form.termMonths} months. Final rate subject to credit assessment.</p>
              </div>
            )}
          </div>
        )}

        {step === 'documents' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Upload Documents</h2>
            <p className="text-sm text-gray-500">Please upload the required documents. Accepted formats: PDF, JPG, PNG.</p>
            {([
              { type: 'id' as Document['type'], label: 'Government-issued ID', hint: 'Passport, Driver\'s license, etc.' },
              { type: 'payslip' as Document['type'], label: 'Recent Payslip / Income Proof', hint: 'Last 1\u20133 months' },
              { type: 'bank_statement' as Document['type'], label: 'Bank Statement', hint: 'Last 3\u20136 months' },
            ] as { type: Document['type']; label: string; hint: string }[]).map(docType => {
              const uploaded = documents.find(d => d.type === docType.type);
              return (
                <div key={docType.type} className="border border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{docType.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{docType.hint}</p>
                    </div>
                    {uploaded && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Uploaded</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocUpload(docType.type, file.name);
                        }}
                      />
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                        <Upload className="w-3 h-3" />
                        {uploaded ? 'Replace file' : 'Choose file'}
                      </span>
                    </label>
                    {uploaded && (
                      <p className="text-xs text-gray-500 mt-1">{uploaded.name}</p>
                    )}
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-gray-400">* Documents can also be submitted later. Uploading now speeds up processing.</p>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Review Your Application</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Personal</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium">{form.firstName} {form.lastName}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{form.email}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{form.phone}</span></div>
                  <div><span className="text-gray-500">DOB:</span> <span className="font-medium">{form.dateOfBirth}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{form.address}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Financials</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Employment:</span> <span className="font-medium">{form.employmentStatus.replace('_', ' ')}</span></div>
                  <div><span className="text-gray-500">Annual Income:</span> <span className="font-medium">${parseFloat(form.annualIncome || '0').toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Monthly Expenses:</span> <span className="font-medium">${parseFloat(form.monthlyExpenses || '0').toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Credit Score:</span> <span className="font-medium">{form.creditScore}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Loan</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Type:</span> <span className="font-medium">{form.loanType}</span></div>
                  <div><span className="text-gray-500">Amount:</span> <span className="font-medium">${parseFloat(form.requestedAmount || '0').toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Term:</span> <span className="font-medium">{form.termMonths} months</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Purpose:</span> <span className="font-medium">{form.purpose}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documents ({documents.length} uploaded)</p>
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-400">No documents uploaded yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {documents.map(d => (
                      <li key={d.id} className="text-sm text-gray-700">✓ {d.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={back}
          disabled={stepIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        {step === 'review' ? (
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            Submit Application
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={next} className="flex items-center gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
