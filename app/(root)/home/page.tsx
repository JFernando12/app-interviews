"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/dynamodb";
import {
  QuestionType as QuestionTypeEnum,
  QuestionTypeUtils,
} from "@/types/enums";
import { HelpCircle, Code, Users, Target, Zap, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface QuestionTypeDisplay {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function HomePage() {
  const router = useRouter();

  // Define question types
  const questionTypes: QuestionTypeDisplay[] = [
    {
      id: QuestionTypeEnum.BEHAVIORAL,
      name:
        QuestionTypeUtils.getDisplayName(QuestionTypeEnum.BEHAVIORAL) +
        " Questions",
      description: QuestionTypeUtils.getDescription(
        QuestionTypeEnum.BEHAVIORAL
      ),
      icon: <Users className="w-full h-full" />,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100",
      borderColor: "border-blue-200 group-hover:border-blue-300",
    },
    {
      id: QuestionTypeEnum.TECHNICAL,
      name:
        QuestionTypeUtils.getDisplayName(QuestionTypeEnum.TECHNICAL) +
        " Questions",
      description: QuestionTypeUtils.getDescription(QuestionTypeEnum.TECHNICAL),
      icon: <Code className="w-full h-full" />,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100",
      borderColor: "border-purple-200 group-hover:border-purple-300",
    },
    {
      id: QuestionTypeEnum.SYSTEM_DESIGN,
      name: QuestionTypeUtils.getDisplayName(QuestionTypeEnum.SYSTEM_DESIGN),
      description: QuestionTypeUtils.getDescription(
        QuestionTypeEnum.SYSTEM_DESIGN
      ),
      icon: <Target className="w-full h-full" />,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 via-green-100 to-emerald-100",
      borderColor: "border-green-200 group-hover:border-green-300",
    },
    {
      id: QuestionTypeEnum.LEADERSHIP,
      name:
        QuestionTypeUtils.getDisplayName(QuestionTypeEnum.LEADERSHIP) +
        " & Management",
      description: QuestionTypeUtils.getDescription(
        QuestionTypeEnum.LEADERSHIP
      ),
      icon: <Zap className="w-full h-full" />,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100",
      borderColor: "border-orange-200 group-hover:border-orange-300",
    },
    {
      id: QuestionTypeEnum.CODING,
      name:
        QuestionTypeUtils.getDisplayName(QuestionTypeEnum.CODING) +
        " Questions",
      description: QuestionTypeUtils.getDescription(QuestionTypeEnum.CODING),
      icon: <Code className="w-full h-full" />,
      color: "text-indigo-600",
      bgColor: "bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-100",
      borderColor: "border-indigo-200 group-hover:border-indigo-300",
    },
    {
      id: "all",
      name: "All Questions",
      description:
        "Browse your complete question collection across all categories",
      icon: <HelpCircle className="w-full h-full" />,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100",
      borderColor: "border-gray-200 group-hover:border-gray-300",
    },
  ];

  const handleTypeSelect = (typeId: string) => {
    router.push(`/home/${typeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Question Categories"
          description="Choose a category to practice interview questions or browse your complete collection."
        />

        {/* Question Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`
                relative p-3 sm:p-4 lg:p-6 rounded-xl border transition-all duration-200 cursor-pointer
                hover:shadow-lg active:scale-[0.98] sm:hover:scale-[1.02] group
                bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
                hover:border-gray-300 dark:hover:border-gray-600 shadow-sm
              `}
            >
              {/* Icon */}
              <div className={`${type.color} mb-2 sm:mb-3 lg:mb-4`}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10">
                  {type.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 group-hover:text-gray-800 dark:group-hover:text-gray-200 leading-tight">
                {type.name}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                {type.description}
              </p>

              {/* Call to Action */}
              <div className="flex items-center justify-between">
                <div
                  className={`${type.color} transform transition-transform group-hover:translate-x-1`}
                >
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
