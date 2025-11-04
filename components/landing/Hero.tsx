'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Dipercaya oleh 1000+ organisasi</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Manajemen Relawan{' '}
              <span className="text-green-600 dark:text-green-500">
                Jadi Sederhana
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Eliminasi 90% kekacauan administrasi. Sederhanakan pendaftaran, penjadwalan shift, dan komunikasi relawan dalam satu platform yang kuat.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 group">
                Mulai Gratis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Lihat Demo
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">90%</div>
                <div className="text-sm text-muted-foreground">
                  Time Saved
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">
                  Events Managed
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-muted-foreground">
                  Volunteers
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/volunbase-full-1842.webp"
                alt="Volunbase Dashboard"
                width={600}
                height={400}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-500/20 dark:bg-green-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
