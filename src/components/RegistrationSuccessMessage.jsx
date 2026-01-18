'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function RegistrationSuccessMessage() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-bounce">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-green-400 flex items-center gap-3">
        <CheckCircle className="h-6 w-6 animate-pulse" />
        <div>
          <p className="font-bold text-lg">Registered Successfully!</p>
          <p className="text-sm">Awaiting Approval from Admin</p>
        </div>
      </div>
    </div>
  );
}
