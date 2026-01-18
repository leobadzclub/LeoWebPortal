'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield } from 'lucide-react';
import BackButton from '@/src/components/BackButton';
import { TERMS_AND_CONDITIONS } from '@/src/lib/termsAndConditions';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg mb-4">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-blue-400">Terms and Conditions</span>
          </h1>
          <p className="text-xl text-gray-300">
            LEO Badminton Club Membership Agreement
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: {TERMS_AND_CONDITIONS.lastUpdated}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-400" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                Please read these Terms and Conditions carefully before registering with LEO Badminton Club. 
                By completing your registration, you acknowledge that you have read, understood, and agree to be 
                bound by these terms.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {TERMS_AND_CONDITIONS.sections.map((section, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    {section.heading}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p className="leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-900/20 border-blue-700 mt-8">
            <CardContent className="py-6">
              <p className="text-blue-400 text-center">
                <strong>Questions or Concerns?</strong>
              </p>
              <p className="text-gray-300 text-center mt-2">
                Contact us at{' '}
                <a href="mailto:leosportzclub@gmail.com" className="text-yellow-400 hover:underline">
                  leosportzclub@gmail.com
                </a>
                {' '}or call{' '}
                <a href="tel:+12892214150" className="text-yellow-400 hover:underline">
                  +1 (289) 221-4150
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
