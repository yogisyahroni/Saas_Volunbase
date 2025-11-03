'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'NPO Manager',
    content:
      'Volunbase saved us 15 hours per event. No more messy WhatsApp groups or lost Excel files. Our volunteers love how easy it is to sign up.',
    rating: 5,
    avatar: 'SJ',
  },
  {
    name: 'Rian Pratama',
    role: 'University Event Coordinator',
    content:
      'We managed 200 volunteers for our campus festival. The real-time dashboard and auto-reminders were game-changers. Highly recommended!',
    rating: 5,
    avatar: 'RP',
  },
  {
    name: 'Amanda Lee',
    role: 'Community Organizer',
    content:
      "The free plan was perfect for our small monthly meetups. When we grew, upgrading was seamless. It's exactly what we needed.",
    rating: 5,
    avatar: 'AL',
  },
  {
    name: 'David Chen',
    role: 'Festival Director',
    content:
      'Event Pass was perfect for our annual music festival. 500 volunteers, 10 admins, all coordinated flawlessly. Worth every penny.',
    rating: 5,
    avatar: 'DC',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Loved by Event Organizers
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of organizations that trust Volunbase.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-sm mb-6 leading-relaxed">
                  {testimonial.content}
                </p>

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-green-500/10 text-green-700 dark:text-green-400 font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
