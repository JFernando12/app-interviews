'use client';

import { useRouter } from 'next/navigation';
import { QuestionType, QuestionTypeUtils } from '@/types/enums';
import {
  HelpCircle,
  Code,
  Users,
  Target,
  Zap,
  ArrowRight,
  Lock,
  Brain,
} from 'lucide-react';

const questionTypes = [
  {
    id: QuestionType.TECHNICAL,
    name: QuestionTypeUtils.getDisplayName(QuestionType.TECHNICAL),
    description: QuestionTypeUtils.getDescription(QuestionType.TECHNICAL),
    icon: <Code className="w-full h-full" />,
    color: 'text-purple-500 dark:text-purple-400',
    iconBg: 'bg-purple-500/10',
    href: '/practice/technical',
    available: true,
  },
  {
    id: QuestionType.AI_ENGINEER,
    name: QuestionTypeUtils.getDisplayName(QuestionType.AI_ENGINEER),
    description: QuestionTypeUtils.getDescription(QuestionType.AI_ENGINEER),
    icon: <Brain className="w-full h-full" />,
    color: 'text-violet-500 dark:text-violet-400',
    iconBg: 'bg-violet-500/10',
    href: '/practice/ai-engineer',
    available: true,
  },
  {
    id: QuestionType.BEHAVIORAL,
    name: QuestionTypeUtils.getDisplayName(QuestionType.BEHAVIORAL),
    description: QuestionTypeUtils.getDescription(QuestionType.BEHAVIORAL),
    icon: <Users className="w-full h-full" />,
    color: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-500/10',
    href: '/practice/behavioral',
    available: false,
  },
  {
    id: QuestionType.HUMAN_RESOURCES,
    name: QuestionTypeUtils.getDisplayName(QuestionType.HUMAN_RESOURCES),
    description: QuestionTypeUtils.getDescription(QuestionType.HUMAN_RESOURCES),
    icon: <HelpCircle className="w-full h-full" />,
    color: 'text-green-500 dark:text-green-400',
    iconBg: 'bg-green-500/10',
    href: '/practice/human-resources',
    available: false,
  },
  {
    id: QuestionType.SYSTEM_DESIGN,
    name: QuestionTypeUtils.getDisplayName(QuestionType.SYSTEM_DESIGN),
    description: QuestionTypeUtils.getDescription(QuestionType.SYSTEM_DESIGN),
    icon: <Target className="w-full h-full" />,
    color: 'text-orange-500 dark:text-orange-400',
    iconBg: 'bg-orange-500/10',
    href: '#',
    available: false,
  },
  {
    id: QuestionType.LEADERSHIP,
    name: QuestionTypeUtils.getDisplayName(QuestionType.LEADERSHIP),
    description: QuestionTypeUtils.getDescription(QuestionType.LEADERSHIP),
    icon: <Zap className="w-full h-full" />,
    color: 'text-red-500 dark:text-red-400',
    iconBg: 'bg-red-500/10',
    href: '#',
    available: false,
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            What do you want to practice?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Choose a category to get started
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-2.5">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => type.available && router.push(type.href)}
              className={`
                flex items-center gap-4 p-4 rounded-xl border transition-all duration-150
                ${type.available
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md active:scale-[0.99] group'
                  : 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/50 opacity-60 cursor-default'
                }
              `}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${type.iconBg} ${type.color} flex-shrink-0 p-2`}>
                {type.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {type.name}
                  </span>
                  {!type.available && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-[10px] font-medium">
                      <Lock className="w-2.5 h-2.5" />
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {type.description}
                </p>
              </div>

              {/* Arrow */}
              {type.available && (
                <ArrowRight className={`w-4 h-4 flex-shrink-0 ${type.color} transition-transform group-hover:translate-x-0.5`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}