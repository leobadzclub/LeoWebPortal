'use client';

import { Clock } from 'lucide-react';

export default function ApprovalPendingBanner({ userName }) {
  return (
    <div className="fixed top-20 left-0 right-0 z-40 animate-pulse">
      <div className="bg-yellow-500 text-navy-900 px-6 py-3 text-center shadow-lg">
        <div className="container mx-auto flex items-center justify-center gap-3">
          <Clock className="h-5 w-5 animate-spin" />
          <p className="font-bold text-lg">
            {userName ? `${userName}, your` : 'Your'} Registration is Under Review
          </p>
          <Clock className="h-5 w-5 animate-spin" />
        </div>
        <p className="text-sm mt-1">
          Awaiting approval from Admin Team • You will be notified once approved
        </p>
      </div>
    </div>
  );
}
