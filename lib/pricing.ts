export interface PricingTier {
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  maxVolunteers: string;
  maxActiveEvents: string;
  admins: string;
  customForm: boolean;
  exportData: boolean;
  removeBranding: boolean;
  popular?: boolean;
}

export const globalPricing: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    currency: 'USD',
    period: 'forever',
    maxVolunteers: '20',
    maxActiveEvents: '1',
    admins: '1',
    customForm: false,
    exportData: false,
    removeBranding: false,
    features: [
      'Up to 20 volunteers per event',
      '1 active event',
      'Basic email notifications',
      'Public registration page',
    ],
  },
  {
    name: 'Starter',
    price: 19,
    currency: 'USD',
    period: 'month',
    maxVolunteers: '70',
    maxActiveEvents: '5',
    admins: '1',
    customForm: true,
    exportData: false,
    removeBranding: true,
    popular: true,
    features: [
      'Up to 70 volunteers per event',
      '5 active events',
      'Custom form fields',
      'Remove branding',
      'Email confirmation & reminders',
    ],
  },
  {
    name: 'Pro',
    price: 49,
    currency: 'USD',
    period: 'month',
    maxVolunteers: 'Unlimited',
    maxActiveEvents: 'Unlimited',
    admins: 'Unlimited',
    customForm: true,
    exportData: true,
    removeBranding: true,
    features: [
      'Unlimited volunteers',
      'Unlimited active events',
      'Unlimited admin users',
      'Export data to Excel',
      'Priority support',
    ],
  },
  {
    name: 'Event Pass',
    price: 79,
    currency: 'USD',
    period: 'event',
    maxVolunteers: 'Unlimited',
    maxActiveEvents: '1',
    admins: 'Unlimited',
    customForm: true,
    exportData: true,
    removeBranding: true,
    features: [
      'Unlimited volunteers',
      '1 event (30 days active)',
      'Unlimited admin users',
      'All Pro features',
      'Perfect for festivals & conferences',
    ],
  },
];

export const indonesiaPricing: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    currency: 'IDR',
    period: 'selamanya',
    maxVolunteers: '20',
    maxActiveEvents: '1',
    admins: '1',
    customForm: false,
    exportData: false,
    removeBranding: false,
    features: [
      'Maksimal 20 relawan per acara',
      '1 acara aktif',
      'Notifikasi email dasar',
      'Halaman pendaftaran publik',
    ],
  },
  {
    name: 'Starter',
    price: 229000,
    currency: 'IDR',
    period: 'bulan',
    maxVolunteers: '70',
    maxActiveEvents: '5',
    admins: '1',
    customForm: true,
    exportData: false,
    removeBranding: true,
    popular: true,
    features: [
      'Maksimal 70 relawan per acara',
      '5 acara aktif',
      'Form kustom',
      'Hapus branding',
      'Konfirmasi & reminder email',
    ],
  },
  {
    name: 'Pro',
    price: 599000,
    currency: 'IDR',
    period: 'bulan',
    maxVolunteers: 'Tanpa Batas',
    maxActiveEvents: 'Tanpa Batas',
    admins: 'Tanpa Batas',
    customForm: true,
    exportData: true,
    removeBranding: true,
    features: [
      'Relawan tanpa batas',
      'Acara aktif tanpa batas',
      'Admin tanpa batas',
      'Ekspor data ke Excel',
      'Dukungan prioritas',
    ],
  },
  {
    name: 'Event Pass',
    price: 999000,
    currency: 'IDR',
    period: 'acara',
    maxVolunteers: 'Tanpa Batas',
    maxActiveEvents: '1',
    admins: 'Tanpa Batas',
    customForm: true,
    exportData: true,
    removeBranding: true,
    features: [
      'Relawan tanpa batas',
      '1 acara (aktif 30 hari)',
      'Admin tanpa batas',
      'Semua fitur Pro',
      'Sempurna untuk festival & konferensi',
    ],
  },
];

export function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';

  if (currency === 'IDR') {
    return `Rp ${price.toLocaleString('id-ID')}`;
  }

  return `$${price}`;
}
