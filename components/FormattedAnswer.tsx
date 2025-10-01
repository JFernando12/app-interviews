import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FormattedAnswerProps {
  answer: string;
  isDarkMode?: boolean;
}

export const FormattedAnswer: React.FC<FormattedAnswerProps> = ({ 
  answer, 
  isDarkMode = false 
}) => {
  // Parse the answer text and split into text and code blocks
  const parseAnswer = (text: string) => {
    const parts = [];
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore });
        }
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push({ type: 'code', content: code, language });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    return parts;
  };

  const formatTextContent = (text: string) => {
    // Handle inline code with backticks
    const inlineCodeRegex = /`([^`]+)`/g;
    const parts = text.split(inlineCodeRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is inline code
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm font-mono"
          >
            {part}
          </code>
        );
      }
      // Regular text - preserve line breaks
      return part.split('\n').map((line, lineIndex, lines) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  const parts = parseAnswer(answer);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <div key={index} className="relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-1 bg-black/20 backdrop-blur-sm text-xs text-white/80 rounded uppercase font-mono">
                  {part.language}
                </span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                <SyntaxHighlighter
                  language={part.language}
                  style={isDarkMode ? vscDarkPlus : oneLight}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    background: 'transparent',
                    backgroundColor: 'transparent',
                    padding: '1rem',
                  }}
                  showLineNumbers={part.content.split('\n').length > 3}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {part.content}
                </SyntaxHighlighter>
              </div>
            </div>
          );
        } else {
          return (
            <div
              key={index}
              className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
            >
              {formatTextContent(part.content)}
            </div>
          );
        }
      })}
    </div>
  );
};