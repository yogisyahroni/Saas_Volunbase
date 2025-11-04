"use client";

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserLocation } from '@/hooks/use-location';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  globalPricing,
  indonesiaPricing,
  formatPrice,
} from '@/lib/pricing';

export default function Pricing() {
  const { isIndonesia, isLoading } = useUserLocation();
  const router = useRouter();
  const [tier, setTier] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('vb_tier') || '';
      setTier(t);
    }
  }, []);

  const pricing = isIndonesia ? indonesiaPricing : globalPricing;

  if (isLoading) {
    return (
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your needs. Start free, upgrade anytime.
          </p>
          {isIndonesia && (
            <p className="mt-4 text-green-600 dark:text-green-500 font-medium">
              Special pricing for Indonesia
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricing.map((tier, index) => (
            <Card
              key={index}
              className={`relative ${
                tier.popular
                  ? 'border-green-500 border-2 shadow-xl scale-105'
                  : 'border-2'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(tier.price, tier.currency)}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-muted-foreground">
                      /{tier.period}
                    </span>
                  )}
                </div>
                <Button
                  className={
                    tier.popular
                      ? 'w-full bg-green-600 hover:bg-green-700'
                      : 'w-full'
                  }
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => {
                    if (tier.price === 0) {
                      router.push('/(auth)/register');
                    } else {
                      if (tier === 'pro') {
                        router.push('/admin');
                      } else {
                        const currency = isIndonesia ? 'IDR' : 'USD';
                        const plan = encodeURIComponent(tier.name);
                        router.push(`/admin?upgrade=${plan}&currency=${currency}`);
                      }
                    }
                  }}
                >
                  {tier.price === 0 ? 'Start Free' : (tier === 'pro' ? 'Manage Plan' : 'Get Started')}
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Max Volunteers
                    </span>
                    <span className="font-medium">{tier.maxVolunteers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Events</span>
                    <span className="font-medium">{tier.maxActiveEvents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Admins</span>
                    <span className="font-medium">{tier.admins}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {tier.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start gap-2"
                    >
                      <Check className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 text-muted-foreground">
          <p>
            All plans include secure data storage, automated emails, and 24/7
            uptime
          </p>
        </div>
      </div>
    </section>
  );
}
