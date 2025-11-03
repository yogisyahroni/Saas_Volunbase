'use client';

import { UserPlus, Calendar, Share2, Users } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Sign up in 30 seconds. No credit card required for the free plan.',
  },
  {
    icon: Calendar,
    title: 'Set Up Your Event',
    description:
      'Create your event and add shifts with time slots and volunteer limits.',
  },
  {
    icon: Share2,
    title: 'Share the Link',
    description:
      'Get a unique registration link and share it via WhatsApp, Instagram, or email.',
  },
  {
    icon: Users,
    title: 'Manage Volunteers',
    description:
      'Watch registrations come in real-time. Volunteers get automatic confirmations and reminders.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Get started in minutes. No technical knowledge required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <Icon className="w-8 h-8 text-green-600 dark:text-green-500" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-green-500/50 to-transparent"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
