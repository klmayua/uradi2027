'use client';

import { useState } from 'react';
import { Users, MapPin, Calendar, CheckCircle, UserPlus, Megaphone, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function VolunteerPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lga: '',
    ward: '',
    interest: '',
    availability: '',
    experience: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const volunteerRoles = [
    {
      id: 'canvasser',
      icon: UserPlus,
      title: 'Door-to-Door Canvasser',
      description: 'Engage with voters in their homes, share campaign messages, and collect feedback.',
    },
    {
      id: 'mobilizer',
      icon: Megaphone,
      title: 'Community Mobilizer',
      description: 'Organize community events, rallies, and voter registration drives.',
    },
    {
      id: 'polling',
      icon: ClipboardList,
      title: 'Polling Agent',
      description: 'Monitor polling units on election day and report results.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-uradi-bg-primary flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-uradi-text-primary mb-4">
            Welcome to the Team!
          </h1>
          <p className="text-uradi-text-secondary mb-8">
            Thank you for signing up as a volunteer. We'll contact you shortly
            with next steps and training information.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-uradi-bg-primary">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-uradi-border">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-uradi-gold font-bold text-xl">
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-uradi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-uradi-gold" />
            </div>
            <h1 className="text-3xl font-bold text-uradi-text-primary mb-4">
              Become a Volunteer
            </h1>
            <p className="text-uradi-text-secondary max-w-xl mx-auto">
              Join our team of dedicated volunteers working to bring positive change.
              Your time and skills can make a real difference.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-uradi-gold text-uradi-bg-primary'
                      : 'bg-uradi-bg-tertiary text-uradi-text-tertiary'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > s ? 'bg-uradi-gold' : 'bg-uradi-bg-tertiary'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-uradi-bg-secondary rounded-xl p-6 sm:p-8 border border-uradi-border">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-uradi-text-primary">
                  Choose Your Role
                </h2>
                <div className="grid gap-4">
                  {volunteerRoles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, interest: role.id })}
                      className={`flex items-start gap-4 p-4 rounded-lg border text-left transition-colors ${
                        formData.interest === role.id
                          ? 'border-uradi-gold bg-uradi-gold/5'
                          : 'border-uradi-border hover:border-uradi-gold/50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-uradi-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <role.icon className="w-5 h-5 text-uradi-gold" />
                      </div>
                      <div>
                        <h3 className="font-medium text-uradi-text-primary">{role.title}</h3>
                        <p className="text-sm text-uradi-text-secondary mt-1">{role.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.interest}
                    className="px-6 py-3 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-uradi-text-primary">
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email Address"
                    required
                    className="w-full px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone Number"
                    required
                    className="w-full px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-uradi-text-tertiary" />
                      <select
                        value={formData.lga}
                        onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
                      >
                        <option value="">Select LGA</option>
                        <option value="dutse">Dutse</option>
                        <option value="hadejia">Hadejia</option>
                        <option value="birnin-kudu">Birnin Kudu</option>
                        <option value="gumel">Gumel</option>
                        <option value="kazaure">Kazaure</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      placeholder="Ward"
                      className="px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-uradi-border text-uradi-text-primary font-medium rounded-lg hover:bg-uradi-bg-tertiary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.name || !formData.email || !formData.phone || !formData.lga}
                    className="px-6 py-3 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-uradi-text-primary">
                  Availability & Experience
                </h2>
                <div className="space-y-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-uradi-text-tertiary" />
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
                    >
                      <option value="">Availability</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="weekends">Weekends only</option>
                      <option value="evenings">Evenings only</option>
                    </select>
                  </div>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="Tell us about any relevant experience (optional)"
                    rows={4}
                    className="w-full px-4 py-3 bg-uradi-bg-primary border border-uradi-border rounded-lg text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-uradi-border text-uradi-text-primary font-medium rounded-lg hover:bg-uradi-bg-tertiary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.availability}
                    className="px-6 py-3 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
