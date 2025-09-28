'use client';

import { useState } from 'react';
import { FileText, Upload, Video, ArrowRight, Plus } from 'lucide-react';

interface CreationOption {
  id: 'manual' | 'json' | 'video';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface InterviewCreationOptionsProps {
  onSelectOption: (option: 'manual' | 'json' | 'video') => void;
  onCancel: () => void;
}

const creationOptions: CreationOption[] = [
  {
    id: 'video',
    title: 'Video Upload',
    description: 'Upload interview video for automatic processing and analysis',
    icon: Video,
    color: 'purple',
  },
  {
    id: 'manual',
    title: 'Manual Entry',
    description:
      'Create interview manually with form input and upload questions',
    icon: FileText,
    color: 'blue',
  },
  {
    id: 'json',
    title: 'JSON Import',
    description: 'Import interview data from a JSON file',
    icon: Upload,
    color: 'green',
  },
];

export default function InterviewCreationOptions({
  onSelectOption,
  onCancel,
}: InterviewCreationOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<'manual' | 'json' | 'video' | null>(null);

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-blue-200 dark:border-blue-700',
        bg: isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800',
        icon: 'text-blue-600 dark:text-blue-400',
        title: isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white',
        description: isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-green-200 dark:border-green-700',
        bg: isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800',
        icon: 'text-green-600 dark:text-green-400',
        title: isSelected ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white',
        description: isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400',
        button: 'bg-green-600 hover:bg-green-700',
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-purple-200 dark:border-purple-700',
        bg: isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-gray-800',
        icon: 'text-purple-600 dark:text-purple-400',
        title: isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white',
        description: isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleContinue = () => {
    if (selectedOption) {
      onSelectOption(selectedOption);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Interview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how you'd like to create your interview
        </p>
      </div>

      <div className="space-y-4">
        {creationOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const colors = getColorClasses(option.color, isSelected);
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full p-6 border-2 rounded-xl transition-all duration-200 text-left hover:shadow-md ${colors.border} ${colors.bg}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white dark:bg-gray-700 shadow-sm' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${colors.title}`}>
                    {option.title}
                  </h3>
                  <p className={`text-sm ${colors.description} mt-1`}>
                    {option.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-current text-white flex items-center justify-center">
                    <Plus className="h-3 w-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedOption}
          className={`flex-1 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedOption 
              ? getColorClasses(creationOptions.find(opt => opt.id === selectedOption)?.color || 'blue', false).button + ' focus:ring-blue-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center">
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </div>
        </button>
      </div>
    </div>
  );
}