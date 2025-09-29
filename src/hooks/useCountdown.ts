import { useState, useEffect, useCallback } from 'react';

interface CountdownState {
  timeString: string;
  isExpired: boolean;
  hours: number;
  minutes: number;
  seconds: number;
}

export const useCountdown = (createdAt?: string | null): CountdownState => {
  const [countdown, setCountdown] = useState<CountdownState>({
    timeString: 'N/A',
    isExpired: false,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateCountdown = useCallback(() => {
    if (!createdAt) {
      return {
        timeString: 'N/A',
        isExpired: false,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const start = new Date(createdAt).getTime();
    if (Number.isNaN(start)) {
      return {
        timeString: 'N/A',
        isExpired: false,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    // 72 horas = 72 * 60 * 60 * 1000 ms
    const deadline = start + 72 * 60 * 60 * 1000;
    const now = Date.now();
    const diffMs = deadline - now;
    
    const isExpired = diffMs < 0;
    const abs = Math.abs(diffMs);
    
    const hours = Math.floor(abs / (1000 * 60 * 60));
    const minutes = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((abs % (1000 * 60)) / 1000);
    
    const sign = isExpired ? '-' : '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeString = `${sign}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    return {
      timeString,
      isExpired,
      hours,
      minutes,
      seconds,
    };
  }, [createdAt]);

  useEffect(() => {
    // Calcular inmediatamente
    setCountdown(calculateCountdown());

    // Actualizar cada segundo
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateCountdown]);

  return countdown;
};
