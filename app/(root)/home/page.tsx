'use client';

import { useRouter } from 'next/navigation';
import { QuestionType, QuestionTypeUtils } from '@/types/enums';
import { HelpCircle, Code, Users, Target, Zap, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const questionTypes = [
  {
    id: QuestionType.TECHNICAL,
    name:
      QuestionTypeUtils.getDisplayName(QuestionType.TECHNICAL) + ' Questions',
    description: QuestionTypeUtils.getDescription(QuestionType.TECHNICAL),
    icon: <Code className="w-full h-full" />,
    color: 'text-purple-600 dark:text-purple-400',
    href: '/home/technical',
  },
  {
    id: QuestionType.BEHAVIORAL,
    name:
      QuestionTypeUtils.getDisplayName(QuestionType.BEHAVIORAL) + ' Questions',
    description: QuestionTypeUtils.getDescription(QuestionType.BEHAVIORAL),
    icon: <Users className="w-full h-full" />,
    color: 'text-blue-600 dark:text-blue-400',
    href: '/home/behavioral',
  },
  {
    id: QuestionType.HUMAN_RESOURCES,
    name:
      QuestionTypeUtils.getDisplayName(QuestionType.HUMAN_RESOURCES) +
      ' Questions',
    description: QuestionTypeUtils.getDescription(QuestionType.HUMAN_RESOURCES),
    icon: <HelpCircle className="w-full h-full" />,
    color: 'text-green-600 dark:text-green-400',
    href: '/home/human-resources',
  },
  {
    id: QuestionType.SYSTEM_DESIGN,
    name:
      QuestionTypeUtils.getDisplayName(QuestionType.SYSTEM_DESIGN) +
      ' Questions',
    description: QuestionTypeUtils.getDescription(QuestionType.SYSTEM_DESIGN),
    icon: <Target className="w-full h-full" />,
    color: 'text-orange-600 dark:text-orange-400',
    href: '/questions',
  },
  {
    id: QuestionType.LEADERSHIP,
    name:
      QuestionTypeUtils.getDisplayName(QuestionType.LEADERSHIP) + ' Questions',
    description: QuestionTypeUtils.getDescription(QuestionType.LEADERSHIP),
    icon: <Zap className="w-full h-full" />,
    color: 'text-red-600 dark:text-red-400',
    href: '/questions',
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <PageHeader
          title="Question Categories"
          description="Choose a category to practice interview questions or browse the complete collection."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => router.push(type.href)}
              className="relative p-4 sm:p-5 lg:p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg active:scale-[0.98] sm:hover:scale-[1.02] group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
            >
              <div className={`${type.color} mb-3`}>
                <div className="w-8 h-8 sm:w-10 sm:h-10">{type.icon}</div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                {type.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed">
                {type.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-medium ${type.color}`}
                >
                  Browse Questions
                </span>
                <ArrowRight
                  className={`w-4 h-4 ${type.color} transform transition-transform group-hover:translate-x-1`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
