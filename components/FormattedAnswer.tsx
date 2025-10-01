import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface FormattedAnswerProps {
  answer: string;
  isDarkMode?: boolean;
}

// Custom syntax highlighting styles with clean, minimal colors
const customLightStyle = {
  'code[class*="language-"]': {
    color: '#2d3748',
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, "Liberation Mono", "Courier New", monospace',
  },
  'pre[class*="language-"]': {
    color: '#2d3748',
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, "Liberation Mono", "Courier New", monospace',
  },
  comment: { color: '#888888', fontStyle: 'italic' },
  prolog: { color: '#888888', fontStyle: 'italic' },
  doctype: { color: '#888888', fontStyle: 'italic' },
  cdata: { color: '#888888', fontStyle: 'italic' },
  punctuation: { color: '#2d3748' },
  property: { color: '#0088cc' },
  tag: { color: '#0088cc' },
  constant: { color: '#0088cc' },
  symbol: { color: '#0088cc' },
  deleted: { color: '#cc0000' },
  boolean: { color: '#cc6600' },
  number: { color: '#cc6600' },
  selector: { color: '#008800' },
  'attr-name': { color: '#008800' },
  string: { color: '#008800' },
  char: { color: '#008800' },
  builtin: { color: '#0088cc' },
  url: { color: '#008800' },
  inserted: { color: '#008800' },
  entity: { color: '#0088cc' },
  atrule: { color: '#8800cc' },
  'attr-value': { color: '#008800' },
  function: { color: '#cc6600' },
  'class-name': { color: '#0088cc' },
  keyword: { color: '#8800cc', fontWeight: 'bold' },
  regex: { color: '#008800' },
  important: { color: '#cc0000', fontWeight: 'bold' },
  variable: { color: '#0088cc' },
  operator: { color: '#2d3748' },
};

const customDarkStyle = {
  'code[class*="language-"]': {
    color: '#e2e8f0',
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, "Liberation Mono", "Courier New", monospace',
  },
  'pre[class*="language-"]': {
    color: '#e2e8f0',
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, "Liberation Mono", "Courier New", monospace',
  },
  comment: { color: '#999999', fontStyle: 'italic' },
  prolog: { color: '#999999', fontStyle: 'italic' },
  doctype: { color: '#999999', fontStyle: 'italic' },
  cdata: { color: '#999999', fontStyle: 'italic' },
  punctuation: { color: '#e2e8f0' },
  property: { color: '#66ccff' },
  tag: { color: '#66ccff' },
  constant: { color: '#66ccff' },
  symbol: { color: '#66ccff' },
  deleted: { color: '#ff6666' },
  boolean: { color: '#ffaa66' },
  number: { color: '#ffaa66' },
  selector: { color: '#66ff99' },
  'attr-name': { color: '#66ff99' },
  string: { color: '#66ff99' },
  char: { color: '#66ff99' },
  builtin: { color: '#66ccff' },
  url: { color: '#66ff99' },
  inserted: { color: '#66ff99' },
  entity: { color: '#66ccff' },
  atrule: { color: '#cc99ff' },
  'attr-value': { color: '#66ff99' },
  function: { color: '#ffaa66' },
  'class-name': { color: '#66ccff' },
  keyword: { color: '#cc99ff', fontWeight: 'bold' },
  regex: { color: '#66ff99' },
  important: { color: '#ff6666', fontWeight: 'bold' },
  variable: { color: '#66ccff' },
  operator: { color: '#e2e8f0' },
};

export const FormattedAnswer: React.FC<FormattedAnswerProps> = ({
  answer,
  isDarkMode = false,
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
                <span className="px-2 py-1 bg-gray-800/90 backdrop-blur-sm text-xs text-gray-300 rounded uppercase font-mono border border-gray-600">
                  {part.language}
                </span>
              </div>
              <div className="bg-black rounded-lg border border-gray-300 dark:border-gray-500 overflow-x-auto">
                <SyntaxHighlighter
                  language={part.language}
                  style={customDarkStyle} // Always use dark style with black background
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    background: 'transparent',
                    backgroundColor: 'transparent',
                    padding: '1rem',
                    whiteSpace: 'pre',
                    overflowX: 'auto',
                    minWidth: 'fit-content',
                  }}
                  showLineNumbers={part.content.split('\n').length > 3}
                  wrapLines={false}
                  wrapLongLines={false}
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