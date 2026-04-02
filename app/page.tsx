'use client';

import Link from 'next/link';
import { ArrowRight, Code, Users, HelpCircle } from 'lucide-react';

export default function Home() {
  const categories = [
    { icon: Code, label: 'Technical', color: 'text-purple-400' },
    { icon: Users, label: 'Behavioral', color: 'text-blue-400' },
    { icon: HelpCircle, label: 'HR', color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-sm sm:max-w-xl mb-4">
          Prepare for your next{' '}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            interview
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-base sm:text-lg max-w-xs sm:max-w-md mb-10 leading-relaxed">
          Real questions organized by category and technology. Practice anytime.
        </p>

        {/* CTA */}
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-base transition-all duration-150 shadow-lg shadow-blue-600/25"
        >
          Start practicing
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Category pills */}
        <div className="flex items-center gap-3 mt-12 flex-wrap justify-center">
          {categories.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 text-sm text-gray-400"
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              {label}
            </div>
          ))}
          <div className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 text-sm text-gray-500">
            + more coming soon
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-gray-600">
        Made with ❤️ for the dev community
      </div>
    </div>
  );
}