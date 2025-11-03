'use client';

import {
  Users,
  Calendar,
  Mail,
  Lock,
  BarChart,
  Zap,
  Clock,
  Shield,
  Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Users,
    title: 'Easy Registration',
    description:
      'Volunteers can register in seconds without creating an account. Just share a link.',
  },
  {
    icon: Calendar,
    title: 'Smart Shift Management',
    description:
      'Create, edit, and manage shifts with automatic slot tracking and real-time updates.',
  },
  {
    icon: Mail,
    title: 'Automated Notifications',
    description:
      'Automatic confirmation emails and H-1 reminders keep everyone informed.',
  },
  {
    icon: Lock,
    title: 'Auto-Lock Full Shifts',
    description:
      'Shifts automatically close when full, preventing overbooking and confusion.',
  },
  {
    icon: BarChart,
    title: 'Real-Time Dashboard',
    description:
      'Monitor registrations, track attendance, and manage your event from one place.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Serverless architecture ensures instant responses and zero downtime.',
  },
  {
    icon: Clock,
    title: 'Save 90% Time',
    description:
      'Eliminate manual coordination via WhatsApp groups and spreadsheets.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-level encryption, CAPTCHA protection, and secure data storage.',
  },
  {
    icon: Globe,
    title: 'Global Payments',
    description:
      'Accept payments via Stripe, Midtrans, QRIS, and local payment methods.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to Manage Volunteers
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to eliminate chaos and save you hours of
            administrative work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
