'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, HelpCircle } from 'lucide-react';

const TopBar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: '/interviews',
      label: 'Interviews',
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: '/questions',
      label: 'Questions',
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                Interview Manager
              </h1>
            </div>
          </div>

          {/* Navigation Links - Aligned to the right */}
          <div className="hidden sm:flex sm:items-center sm:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 shadow-sm border border-blue-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 dark:border-blue-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                const isHidden = menu?.classList.contains('hidden');
                if (isHidden) {
                  menu?.classList.remove('hidden');
                } else {
                  menu?.classList.add('hidden');
                }
              }}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden hidden" id="mobile-menu">
        <div className="px-4 pt-2 pb-3 space-y-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800/50">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TopBar;