import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface FormattedAnswerProps {
  answer: string;
  isDarkMode?: boolean;
}


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
    // First split by backticks to handle inline code
    const inlineCodeRegex = /`([^`]+)`/g;
    const codeParts = text.split(inlineCodeRegex);

    const processedParts = codeParts.map((part, index) => {
      if (index % 2 === 1) {
        // This is inline code
        return (
          <code
            key={`code-${index}`}
            className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs font-mono"
            style={{
              display: 'inline',
              whiteSpace: 'nowrap',
              verticalAlign: 'baseline',
              lineHeight: 'inherit',
            }}
          >
            {part}
          </code>
        );
      } else {
        // This is regular text - handle markdown formatting
        return formatTextPart(part, index);
      }
    });

    return <div className="space-y-2">{processedParts}</div>;
  };

  const formatTextPart = (text: string, keyPrefix: number) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentListType: 'ordered' | 'unordered' | null = null;
    let listItems: React.ReactNode[] = [];

    const flushCurrentList = () => {
      if (currentListType && listItems.length > 0) {
        const ListComponent = currentListType === 'ordered' ? 'ol' : 'ul';
        elements.push(
          <ListComponent
            key={`${keyPrefix}-list-${elements.length}`}
            className={`ml-4 space-y-1 ${
              currentListType === 'ordered' ? 'list-decimal' : 'list-disc'
            } list-inside`}
          >
            {listItems.map((item, itemIndex) => (
              <li
                key={`${keyPrefix}-list-item-${itemIndex}`}
                className="leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ListComponent>
        );
        currentListType = null;
        listItems = [];
      }
    };

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip empty lines but add spacing for double line breaks
      if (line.trim() === '') {
        flushCurrentList();
        // Only add spacing if this is between content (not at start/end)
        if (
          lineIndex > 0 &&
          lineIndex < lines.length - 1 &&
          lines[lineIndex - 1].trim() !== '' &&
          lines[lineIndex + 1].trim() !== ''
        ) {
          elements.push(
            <div key={`${keyPrefix}-space-${lineIndex}`} className="h-2"></div>
          );
        }
        continue;
      }

      // Check for list items
      const unorderedListMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
      const orderedListMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);

      if (unorderedListMatch) {
        // Handle unordered list item
        if (currentListType !== 'unordered') {
          flushCurrentList();
          currentListType = 'unordered';
        }
        const content = formatTextWithBold(unorderedListMatch[1]);
        listItems.push(content);
        continue;
      }

      if (orderedListMatch) {
        // Handle ordered list item
        if (currentListType !== 'ordered') {
          flushCurrentList();
          currentListType = 'ordered';
        }
        const content = formatTextWithBold(orderedListMatch[1]);
        listItems.push(content);
        continue;
      }

      // Not a list item, flush any current list
      flushCurrentList();

      // Handle regular text line with inline formatting
      const formattedLine = formatTextWithBold(line);
      if (formattedLine && line.trim() !== '') {
        elements.push(
          <span
            key={`${keyPrefix}-${lineIndex}`}
            className="block leading-relaxed"
          >
            {formattedLine}
          </span>
        );
      }
    }

    // Flush any remaining list
    flushCurrentList();

    return elements;
  };

  const formatTextWithBold = (text: string): React.ReactNode[] => {
    // Handle bold text **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is bold text
        return (
          <strong
            key={`bold-${index}`}
            className="font-semibold text-gray-900 dark:text-white"
          >
            {part}
          </strong>
        );
      }
      // Regular text
      return part;
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
                  style={customDarkStyle}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '0.7rem',
                    lineHeight: '1.4',
                    background: 'transparent',
                    backgroundColor: 'transparent',
                    padding: '0.75rem',
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
              className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words"
            >
              {formatTextContent(part.content)}
            </div>
          );
        }
      })}
    </div>
  );
};