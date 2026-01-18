'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WaitlistPromotionNotification({ promotedData, onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (promotedData) {
      setShow(true);
      // Auto-hide after 15 seconds
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [promotedData, onClose]);

  if (!show || !promotedData) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-green-400 max-w-md">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 animate-bounce flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-bold text-lg mb-1">🎉 Promoted from Waitlist!</p>
            <p className="text-sm text-green-100">
              You've been moved to the regular schedule for <strong>{promotedData.day}</strong>
            </p>
            <p className="text-xs text-green-200 mt-2">
              Someone unvoted and you were first on the waitlist. You're now confirmed for this session!
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShow(false);
              if (onClose) onClose();
            }}
            className="text-white hover:bg-green-700 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
