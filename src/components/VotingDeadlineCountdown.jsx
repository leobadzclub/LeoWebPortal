'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function VotingDeadlineCountdown({ playDate, votingOpen }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      if (!playDate || !votingOpen) {
        setTimeLeft('Voting Closed');
        return;
      }

      const now = new Date();
      const deadline = new Date(playDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before play
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Voting Closed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Set urgent if less than 6 hours
      setIsUrgent(diff < 6 * 60 * 60 * 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [playDate, votingOpen]);

  if (!votingOpen) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5 text-red-400" />
          <span className="text-red-400 font-semibold">Voting Closed</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 ${isUrgent ? 'bg-red-900/20 border-red-700 animate-pulse' : 'bg-blue-900/20 border-blue-700'}`}>
      <div className="flex items-center justify-center gap-2">
        <Clock className={`h-5 w-5 ${isUrgent ? 'text-red-400 animate-spin' : 'text-blue-400'}`} />
        <div className="text-center">
          <p className="text-xs text-gray-400">Voting closes in</p>
          <p className={`font-bold text-lg ${isUrgent ? 'text-red-400' : 'text-blue-400'}`}>
            {timeLeft}
          </p>
        </div>
      </div>
    </div>
  );
}
