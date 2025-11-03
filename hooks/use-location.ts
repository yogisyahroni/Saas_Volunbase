'use client';

import { useState, useEffect } from 'react';

export function useUserLocation() {
  const [isIndonesia, setIsIndonesia] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function detectLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        setIsIndonesia(data.country_code === 'ID');
      } catch (error) {
        console.error('Failed to detect location:', error);
        setIsIndonesia(false);
      } finally {
        setIsLoading(false);
      }
    }

    detectLocation();
  }, []);

  return { isIndonesia, isLoading };
}
