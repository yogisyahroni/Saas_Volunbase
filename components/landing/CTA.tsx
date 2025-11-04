'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/volunbase-full-1024.webp"
                alt="Volunbase Platform"
                width={500}
                height={400}
                className="w-full h-auto rounded-lg"
                loading="lazy"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Ready to Eliminate the Chaos?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join 1000+ organizations that have streamlined their volunteer
                management with Volunbase. Start free today, no credit card
                required.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                  <span>Set up in under 5 minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                  <span>No credit card required for free plan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                  <span>Cancel anytime, no questions asked</span>
                </div>
              </div>

              <Button size="lg" className="text-lg px-8 group">
                Start Free Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
