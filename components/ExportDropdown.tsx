'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import { Question } from '@/lib/dynamodb';
import { exportToPDF, exportToXLSX, exportToDOCX, generateFilename } from '@/lib/exportUtils';

interface ExportDropdownProps {
  questions: Question[];
  filterType: string;
  searchQuery: string;
  disabled?: boolean;
}

type ExportFormat = 'pdf' | 'xlsx' | 'docx';

export default function ExportDropdown({ 
  questions, 
  filterType, 
  searchQuery, 
  disabled = false 
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions = [
    {
      format: 'pdf' as ExportFormat,
      label: 'PDF Document',
      icon: FileText,
      description: 'Formatted document with questions and answers'
    },
    {
      format: 'xlsx' as ExportFormat,
      label: 'Excel Spreadsheet',
      icon: FileSpreadsheet,
      description: 'Structured data in spreadsheet format'
    },
    {
      format: 'docx' as ExportFormat,
      label: 'Word Document',
      icon: FileImage,
      description: 'Editable document with rich formatting'
    }
  ];

  const handleExport = async (format: ExportFormat) => {
    if (questions.length === 0) {
      alert('No questions to export');
      return;
    }

    setIsExporting(true);
    setIsOpen(false);

    try {
      const filename = generateFilename(filterType, searchQuery, questions.length, format);
      const title = getExportTitle();
      
      console.log(`Exporting ${questions.length} questions as ${format}...`);

      switch (format) {
        case 'pdf':
          await exportToPDF(questions, { filename, title });
          break;
        case 'xlsx':
          exportToXLSX(questions, { filename, title });
          break;
        case 'docx':
          await exportToDOCX(questions, { filename, title });
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      console.log(`Export completed successfully: ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Export failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportTitle = (): string => {
    let title = 'Interview Questions';
    
    if (filterType !== 'all') {
      title += ` - ${filterType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    }
    
    if (searchQuery.trim()) {
      title += ` - Search: "${searchQuery}"`;
    }
    
    return title;
  };

  if (disabled || questions.length === 0) {
    return (
      <button
        disabled
        className="bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
      >
        <div className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export ({questions.length})
        </div>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center">
          <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
          {isExporting ? 'Exporting...' : `Export (${questions.length})`}
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Export Questions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose your preferred format to download {questions.length} question{questions.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="py-2">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    className="w-full flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                  >
                    <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}