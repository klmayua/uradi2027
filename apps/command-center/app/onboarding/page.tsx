'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  MapPin,
  Radio,
  Bell,
  Users,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Onboarding steps configuration
const steps = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Let\'s set up your campaign command center',
    icon: Sparkles,
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Campaign details',
    icon: Building2,
  },
  {
    id: 'admin',
    title: 'Admin Account',
    description: 'Your login credentials',
    icon: User,
  },
  {
    id: 'location',
    title: 'Location',
    description: 'LGA configuration',
    icon: MapPin,
  },
  {
    id: 'osint',
    title: 'Intelligence',
    description: 'OSINT sources',
    icon: Radio,
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Ready to go',
    icon: Check,
  },
];

interface OnboardingData {
  organization: {
    tenantId: string;
    displayName: string;
    state: string;
    candidateName: string;
    candidateParty: string;
  };
  admin: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
  };
  location: {
    selectedLgas: string[];
  };
  osint: {
    selectedSources: string[];
  };
}

const initialData: OnboardingData = {
  organization: {
    tenantId: '',
    displayName: '',
    state: 'Jigawa',
    candidateName: '',
    candidateParty: 'PDP',
  },
  admin: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  },
  location: {
    selectedLgas: [],
  },
  osint: {
    selectedSources: ['news', 'government', 'social'],
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const updateData = (section: keyof OnboardingData, field: string, value: unknown) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validateStep = () => {
    setError('');

    switch (currentStep) {
      case 1: // Organization
        if (!data.organization.tenantId || !data.organization.displayName || !data.organization.candidateName) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 2: // Admin
        if (!data.admin.fullName || !data.admin.email || !data.admin.password) {
          setError('Please fill in all required fields');
          return false;
        }
        if (data.admin.password !== data.admin.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (data.admin.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        break;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/tenants/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: data.organization.tenantId,
          display_name: data.organization.displayName,
          state: data.organization.state,
          candidate_name: data.organization.candidateName,
          candidate_party: data.organization.candidateParty,
          lga_count: data.location.selectedLgas.length || 27,
          admin_user: {
            email: data.admin.email,
            full_name: data.admin.fullName,
            password: data.admin.password,
            phone: data.admin.phone,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to create tenant');
      }

      // Move to complete step
      setCurrentStep(steps.length - 1);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return (
          <OrganizationStep
            data={data.organization}
            onUpdate={(field, value) => updateData('organization', field, value)}
          />
        );
      case 2:
        return (
          <AdminStep
            data={data.admin}
            onUpdate={(field, value) => updateData('admin', field, value)}
          />
        );
      case 3:
        return (
          <LocationStep
            state={data.organization.state}
            selectedLgas={data.location.selectedLgas}
            onUpdate={(lgas) => updateData('location', 'selectedLgas', lgas)}
          />
        );
      case 4:
        return (
          <OSINTStep
            selectedSources={data.osint.selectedSources}
            onUpdate={(sources) => updateData('osint', 'selectedSources', sources)}
          />
        );
      case 5:
        return <CompleteStep onGoToDashboard={() => router.push('/login')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-slate-950 font-bold text-xl">U</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-amber-500 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      idx <= currentStep ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => idx < currentStep && setCurrentStep(idx)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950'
                          : isCompleted
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-xs font-medium ${
                          isActive
                            ? 'text-amber-400'
                            : isCompleted
                            ? 'text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg"
              >
                <p className="text-rose-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            {currentStep < steps.length - 1 && (
              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isSubmitting}
                  className="border-slate-700 hover:bg-slate-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep === steps.length - 2 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Campaign
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep() {
  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-bold text-white mb-4">
        Welcome to URADI-360
      </h2>
      <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">
        Let\'s set up your campaign command center. This will only take a few
        minutes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[
          { icon: Building2, label: 'Campaign Setup', desc: 'Organization details' },
          { icon: Users, label: 'Team Management', desc: 'Invite coordinators' },
          { icon: Radio, label: 'Intelligence', desc: 'OSINT monitoring' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-800 rounded-lg border border-slate-700"
          >
            <item.icon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h4 className="text-white font-medium mb-1">{item.label}</h4>
            <p className="text-slate-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrganizationStep({ data, onUpdate }) {
  const states = ['Jigawa', 'Kano', 'Katsina', 'Sokoto', 'Zamfara', 'Kebbi'];
  const parties = ['PDP', 'APC', 'NNPP', 'LP', 'APGA', 'PRP'];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Campaign Information
        </h3>
        <p className="text-slate-400">Enter your campaign details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Campaign ID *
          </label>
          <Input
            placeholder="e.g., jigawa-2027"
            value={data.tenantId}
            onChange={(e) => onUpdate('tenantId', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="bg-slate-800 border-slate-700"
          />
          <p className="text-xs text-slate-500">Used in URLs, lowercase with hyphens</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Campaign Name *
          </label>
          <Input
            placeholder="e.g., Jigawa 2027"
            value={data.displayName}
            onChange={(e) => onUpdate('displayName', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">State *</label>
          <select
            value={data.state}
            onChange={(e) => onUpdate('state', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
          >
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Party *</label>
          <select
            value={data.candidateParty}
            onChange={(e) => onUpdate('candidateParty', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
          >
            {parties.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Candidate Name *
          </label>
          <Input
            placeholder="e.g., Mustapha Lamido"
            value={data.candidateName}
            onChange={(e) => onUpdate('candidateName', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>
      </div>
    </div>
  );
}

function AdminStep({ data, onUpdate }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Admin Account</h3>
        <p className="text-slate-400">Create your administrator account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-300">Full Name *</label>
          <Input
            placeholder="e.g., John Doe"
            value={data.fullName}
            onChange={(e) => onUpdate('fullName', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-300">Email *</label>
          <Input
            type="email"
            placeholder="admin@campaign.com"
            value={data.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Password *</label>
          <Input
            type="password"
            placeholder="Min 8 characters"
            value={data.password}
            onChange={(e) => onUpdate('password', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Confirm Password *</label>
          <Input
            type="password"
            placeholder="Re-enter password"
            value={data.confirmPassword}
            onChange={(e) => onUpdate('confirmPassword', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-300">Phone</label>
          <Input
            placeholder="+234..."
            value={data.phone}
            onChange={(e) => onUpdate('phone', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>
      </div>
    </div>
  );
}

function LocationStep({ state, selectedLgas, onUpdate }) {
  // Mock LGA data - would come from API
  const lgaData: Record<string, string[]> = {
    Jigawa: [
      'Auyo', 'Babura', 'Birnin Kudu', 'Birniwa', 'Buji',
      'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri',
      'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa',
      'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari',
      'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar',
      'Taura', 'Yankwashi'
    ],
    Kano: [
      'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi',
      'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa',
      // ... abbreviated
    ],
  };

  const lgas = lgaData[state] || [];

  const toggleLga = (lga: string) => {
    if (selectedLgas.includes(lga)) {
      onUpdate(selectedLgas.filter((l) => l !== lga));
    } else {
      onUpdate([...selectedLgas, lga]);
    }
  };

  const toggleAll = () => {
    if (selectedLgas.length === lgas.length) {
      onUpdate([]);
    } else {
      onUpdate([...lgas]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Local Government Areas</h3>
        <p className="text-slate-400">Select the LGAs your campaign will cover</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">
          {selectedLgas.length} of {lgas.length} selected
        </span>
        <button
          onClick={toggleAll}
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          {selectedLgas.length === lgas.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2">
        {lgas.map((lga) => (
          <button
            key={lga}
            onClick={() => toggleLga(lga)}
            className={`p-2 rounded text-sm text-left transition-colors ${
              selectedLgas.includes(lga)
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {lga}
          </button>
        ))}
      </div>
    </div>
  );
}

function OSINTStep({ selectedSources, onUpdate }) {
  const sources = [
    { id: 'news', name: 'News Outlets', desc: 'Daily Trust, Premium Times, Vanguard' },
    { id: 'government', name: 'Government Sources', desc: 'State government websites and announcements' },
    { id: 'social', name: 'Social Media', desc: 'Twitter, Facebook monitoring (requires additional setup)' },
    { id: 'traditional', name: 'Traditional Media', desc: 'Radio, TV monitoring (manual entry)' },
  ];

  const toggleSource = (id: string) => {
    if (selectedSources.includes(id)) {
      onUpdate(selectedSources.filter((s) => s !== id));
    } else {
      onUpdate([...selectedSources, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Intelligence Sources</h3>
        <p className="text-slate-400">Select sources to monitor for campaign intelligence</p>
      </div>

      <div className="space-y-3">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => toggleSource(source.id)}
            className={`w-full p-4 rounded-lg border text-left transition-all ${
              selectedSources.includes(source.id)
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  selectedSources.includes(source.id)
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-slate-500'
                }`}
              >
                {selectedSources.includes(source.id) && (
                  <Check className="w-3 h-3 text-slate-950" />
                )}
              </div>
              <div>
                <h4 className="text-white font-medium">{source.name}</h4>
                <p className="text-slate-500 text-sm">{source.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CompleteStep({ onGoToDashboard }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="w-10 h-10 text-emerald-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">
        Campaign Setup Complete!
      </h2>

      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        Your command center is ready. You can now log in and start managing
        your campaign.
      </p>

      <div className="space-y-3">
        <Button
          onClick={onGoToDashboard}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-8"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}
