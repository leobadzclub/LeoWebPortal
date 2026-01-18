'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloat() {
  const handleClick = () => {
    const message = 'Hello! I would like to know more about LEO Badminton Club.';
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '12892214150';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
