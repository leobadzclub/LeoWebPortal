'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import BackButton from '@/src/components/BackButton';

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg mb-4">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-blue-500">Policies</span>
          </h1>
          <p className="text-xl text-gray-300">
            Club rules and guidelines
          </p>
        </div>

        {/* Placeholder for policies */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-16 text-center">
              <FileText className="h-24 w-24 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-white">Policies Coming Soon</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                We're finalizing our club policies and guidelines. Check back soon for information 
                about membership rules, code of conduct, and more!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
