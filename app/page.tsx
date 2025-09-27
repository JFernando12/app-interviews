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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="heading-xl hero-text mb-8">
              Master Your Interview Process
            </h1>
            <p className="text-body-lg text-white/90 mb-12 max-w-2xl mx-auto">
              Streamline your hiring process with our powerful interview
              questions manager. Organize, search, and access your questions
              with professional efficiency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/questions" className="btn btn-primary btn-lg group">
                Get Started
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="btn btn-secondary btn-lg glass-effect text-white border-white/20 hover:bg-white/20">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="heading-md text-white mb-2">{stat.value}</div>
                  <div className="text-body-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-on-card mb-6">
              Everything You Need for Better Interviews
            </h2>
            <p className="text-body-lg text-secondary-on-card max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to
              conduct professional, structured interviews that help you find the
              best candidates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-8 text-center group hover:scale-105"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="heading-sm text-on-card mb-4">
                  {feature.title}
                </h3>
                <p className="text-body text-secondary-on-card">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative z-10 text-center">
          <h2 className="heading-lg text-white mb-6">
            Ready to Transform Your Interview Process?
          </h2>
          <p className="text-body-lg text-white/90 mb-12 max-w-2xl mx-auto">
            Join thousands of hiring managers who have streamlined their
            interview process and improved their hiring success rate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/questions"
              className="btn btn-primary btn-lg bg-white text-indigo-600 hover:bg-gray-50"
            >
              Start Managing Questions
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Benefits List */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
                <span className="text-body">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="container text-center">
          <div className="text-body text-slate-400 mb-4">
            © 2025 Interview Questions Manager. Built for better hiring.
          </div>
          <div className="flex justify-center space-x-6 text-sm text-slate-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
