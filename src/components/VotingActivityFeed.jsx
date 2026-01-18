'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function VotingActivityFeed({ activities }) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-yellow-400 animate-pulse" />
          Live Activity Feed
        </h3>
        <span className="text-xs text-gray-500">Real-time updates</span>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities && activities.length > 0 ? (
          activities.slice(0, 10).map((activity, index) => (
            <div
              key={index}
              className="text-sm p-2 bg-gray-800 rounded border-l-2 border-yellow-400 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <p className="text-white">
                  <span className="font-semibold text-yellow-400">{activity.userName}</span>
                  {' '}
                  {activity.action === 'voted' ? (
                    <span className="text-green-400">voted</span>
                  ) : (
                    <span className="text-red-400">unvoted</span>
                  )}
                  {' '}
                  {activity.isWaitlist && <span className="text-gray-400">(waitlist)</span>}
                </p>
                <span className="text-xs text-gray-500">
                  {activity.timestamp ? format(activity.timestamp, 'h:mm a') : 'Just now'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}
