'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ className = '', label = 'Back' }) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="outline"
      className={`border-gray-700 hover:bg-gray-800 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
