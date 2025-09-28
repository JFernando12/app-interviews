'use client';

import Link from 'next/link';
import {
  HelpCircle,
  Users,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: HelpCircle,
      title: 'Question Management',
      description:
        'Organize and categorize your interview questions with ease. Never lose track of your best questions again.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Share questions with your team and build a comprehensive question bank together.',
    },
    {
      icon: Target,
      title: 'Smart Organization',
      description:
        'Filter and search through questions by category, difficulty, or keywords to find exactly what you need.',
    },
    {
      icon: Zap,
      title: 'Quick Access',
      description:
        'Access your questions instantly during interviews with our fast and intuitive interface.',
    },
  ];

  const stats = [
    { label: 'Questions Managed', value: '10,000+' },
    { label: 'Interviews Conducted', value: '2,500+' },
    { label: 'Teams Using', value: '500+' },
    { label: 'Success Rate', value: '95%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Interview Questions Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Streamline your hiring process with our powerful interview
                management platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="hero-gradient relative">
              <div className="absolute inset-0 bg-black/10"></div>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 px-8 py-24 text-center">
                <div className="max-w-4xl mx-auto">
                  <h2 className="heading-xl hero-text mb-8">
                    Master Your Interview Process
                  </h2>
                  <p className="text-body-lg text-white/90 mb-12 max-w-2xl mx-auto">
                    Organize, search, and access your interview questions with
                    professional efficiency. Build a comprehensive question bank
                    and collaborate with your team.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link
                      href="/questions"
                      className="btn btn-primary btn-lg group"
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/interviews"
                      className="btn btn-secondary btn-lg glass-effect text-white border-white/20 hover:bg-white/20"
                    >
                      View Interviews
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="heading-md text-white mb-2">
                          {stat.value}
                        </div>
                        <div className="text-body-sm text-white/80">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for Better Interviews
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our comprehensive platform provides all the tools you need to
                conduct professional, structured interviews that help you find
                the best candidates.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600 text-center group hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 px-8 py-16 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Ready to Transform Your Interview Process?
                </h2>
                <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto">
                  Join thousands of hiring managers who have streamlined their
                  interview process and improved their hiring success rate.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Link
                    href="/questions"
                    className="btn btn-primary btn-lg bg-white text-blue-600 hover:bg-gray-50"
                  >
                    Start Managing Questions
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/interviews"
                    className="btn btn-secondary btn-lg glass-effect text-white border-white/20 hover:bg-white/20"
                  >
                    View Interviews
                  </Link>
                </div>

                {/* Benefits List */}
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {[
                    'Organize questions by category',
                    'Search and filter instantly',
                    'Collaborate with your team',
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center text-white/90"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 dark:bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-8">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                © 2025 Interview Questions Manager. Built for better hiring.
              </div>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <button className="hover:text-gray-300 transition-colors">
                  Privacy Policy
                </button>
                <button className="hover:text-gray-300 transition-colors">
                  Terms of Service
                </button>
                <button className="hover:text-gray-300 transition-colors">
                  Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
