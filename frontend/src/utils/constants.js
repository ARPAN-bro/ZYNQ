// frontend/src/utils/constants.js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export const DONATION_TIERS = [
  { amount: 99, label: 'Coffee Supporter', description: 'Buy us a coffee' },
  { amount: 299, label: 'Music Lover', description: 'Support the platform' },
  { amount: 999, label: 'Super Fan', description: 'Become a super fan' }
];

export const DB_NAME = 'spotify-offline-music';
export const STORE_NAME = 'songs';