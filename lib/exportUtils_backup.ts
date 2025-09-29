import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { Question } from './dynamodb';
import { QuestionTypeUtils } from '@/types/enums';

export interface ExportOptions {
  filename?: string;
  title?: string;
  includeMetadata?: boolean;
}

/**
 * Export questions to PDF format
 */
export const exportToPDF = async (
  questions: Question[],
  options: ExportOptions = {}
) => {
  const {
    filename = 'questions-export.pdf',
    title = 'Interview Questions',
    includeMetadata = true,
  } = options;

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Simple color palette - only black and gray
  const colors = {
    black: [0, 0, 0],
    darkGray: [60, 60, 60],
    lightGray: [150, 150, 150],
    veryLightGray: [220, 220, 220]
  };

  // Helper function to add text with wrapping and better formatting
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10,
    color: number[] = colors.black
  ) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.4;

    for (let i = 0; i < lines.length; i++) {
      const currentY = y + i * lineHeight;
      if (currentY > pageHeight - margin - 20) {
        doc.addPage();
        y = margin;
        doc.text(lines[i], x, margin + i * lineHeight);
      } else {
        doc.text(lines[i], x, currentY);
      }
    }

    return y + lines.length * lineHeight + 5;
  };

  // Helper function to add a simple header
  const addSimpleHeader = (
    text: string,
    y: number
  ) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.text(text, margin, y);
    return y + 15;
  };

  // Title with styling
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  yPosition = addWrappedText(
    title,
    margin,
    yPosition + 15,
    maxWidth,
    24,
    colors.primary
  );

  // Add a line under the title
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Metadata section with improved styling
  if (includeMetadata) {
    yPosition = addHeaderBox('Export Information', yPosition, colors.accent);

    doc.setFont('helvetica', 'normal');
    const metadata = [
      `📊 Total Questions: ${questions.length}`,
      `📅 Export Date: ${new Date().toLocaleDateString()}`,
      `🕒 Export Time: ${new Date().toLocaleTimeString()}`,
    ];

    metadata.forEach((line) => {
      yPosition = addWrappedText(
        line,
        margin + 5,
        yPosition,
        maxWidth - 10,
        10,
        colors.secondary
      );
    });
    yPosition += 15;
  }

  // Questions with improved formatting
  questions.forEach((question, index) => {
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = margin;
    }

    // Question number and type with colored background
    const questionTitle = `${index + 1}. ${QuestionTypeUtils.getDisplayName(
      question.type
    )}`;
    yPosition = addHeaderBox(questionTitle, yPosition + 10);

    // Programming language badge (if available)
    if (question.programming_language) {
      doc.setFillColor(
        colors.lightGray[0],
        colors.lightGray[1],
        colors.lightGray[2]
      );
      doc.setDrawColor(
        colors.secondary[0],
        colors.secondary[1],
        colors.secondary[2]
      );
      doc.roundedRect(margin, yPosition, 60, 8, 2, 2, 'FD');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(
        colors.secondary[0],
        colors.secondary[1],
        colors.secondary[2]
      );
      doc.text(question.programming_language, margin + 3, yPosition + 5);
      yPosition += 15;
    }

    // Context section with icon
    if (question.context && question.context.trim()) {
      doc.setFont('helvetica', 'bold');
      yPosition = addWrappedText(
        '📋 Context:',
        margin,
        yPosition + 5,
        maxWidth,
        11,
        colors.primary
      );
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText(
        question.context,
        margin + 5,
        yPosition,
        maxWidth - 5,
        10,
        colors.text
      );
      yPosition += 5;
    }

    // Question section with icon
    doc.setFont('helvetica', 'bold');
    yPosition = addWrappedText(
      '❓ Question:',
      margin,
      yPosition + 5,
      maxWidth,
      11,
      colors.primary
    );
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(
      question.question,
      margin + 5,
      yPosition,
      maxWidth - 5,
      10,
      colors.text
    );
    yPosition += 5;

    // Answer section with icon
    doc.setFont('helvetica', 'bold');
    yPosition = addWrappedText(
      '✅ Answer:',
      margin,
      yPosition + 5,
      maxWidth,
      11,
      colors.accent
    );
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(
      question.answer,
      margin + 5,
      yPosition,
      maxWidth - 5,
      10,
      colors.text
    );

    // Add separator line between questions
    if (index < questions.length - 1) {
      yPosition += 10;
      doc.setDrawColor(
        colors.lightGray[0],
        colors.lightGray[1],
        colors.lightGray[2]
      );
      doc.setLineWidth(0.3);
      doc.line(margin + 10, yPosition, pageWidth - margin - 10, yPosition);
      yPosition += 10;
    } else {
      yPosition += 20;
    }
  });

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(
      colors.secondary[0],
      colors.secondary[1],
      colors.secondary[2]
    );
    doc.text(
      `Page ${i} of ${totalPages} • Generated ${new Date().toLocaleDateString()}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  doc.save(filename);
};

/**
 * Export questions to XLSX format
 */
export const exportToXLSX = (
  questions: Question[],
  options: ExportOptions = {}
) => {
  const { filename = 'questions-export.xlsx', title = 'Interview Questions' } =
    options;

  // Prepare data for Excel
  const data = questions.map((question, index) => ({
    'Question #': index + 1,
    Type: QuestionTypeUtils.getDisplayName(question.type),
    'Programming Language': question.programming_language || '',
    Context: question.context || '',
    Question: question.question,
    Answer: question.answer,
    'Created Date': new Date(question.created_at).toLocaleDateString(),
    'Updated Date': new Date(question.updated_at).toLocaleDateString(),
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Question #
    { wch: 20 }, // Type
    { wch: 20 }, // Programming Language
    { wch: 30 }, // Context
    { wch: 50 }, // Question
    { wch: 50 }, // Answer
    { wch: 15 }, // Created Date
    { wch: 15 }, // Updated Date
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, title);

  // Export file
  XLSX.writeFile(workbook, filename);
};

/**
 * Export questions to DOCX format
 */
export const exportToDOCX = async (
  questions: Question[],
  options: ExportOptions = {}
) => {
  const {
    filename = 'questions-export.docx',
    title = 'Interview Questions',
    includeMetadata = true,
  } = options;

  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  );

  // Metadata
  if (includeMetadata) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total Questions: ${questions.length}`,
            break: 1,
          }),
          new TextRun({
            text: `Export Date: ${new Date().toLocaleDateString()}`,
            break: 1,
          }),
          new TextRun({
            text: `Export Time: ${new Date().toLocaleTimeString()}`,
            break: 1,
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  // Questions
  questions.forEach((question, index) => {
    // Question header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${QuestionTypeUtils.getDisplayName(
              question.type
            )}`,
            bold: true,
            size: 28,
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    // Programming language
    if (question.programming_language) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Language: ${question.programming_language}`,
              italics: true,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    // Context
    if (question.context && question.context.trim()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Context: ',
              bold: true,
            }),
            new TextRun({
              text: question.context,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    // Question
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Question: ',
            bold: true,
          }),
          new TextRun({
            text: question.question,
          }),
        ],
        spacing: { after: 120 },
      })
    );

    // Answer
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Answer: ',
            bold: true,
          }),
          new TextRun({
            text: question.answer,
          }),
        ],
        spacing: { after: 240 },
      })
    );
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // Generate and save the document
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};

/**
 * Generate filename based on current filters
 */
export const generateFilename = (
  filterType: string, 
  searchQuery: string, 
  questionCount: number, 
  extension: string
): string => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let baseName = 'interview-questions';
  
  if (filterType !== 'all') {
    baseName += `-${filterType.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }
  
  if (searchQuery.trim()) {
    const sanitizedQuery = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    baseName += `-search-${sanitizedQuery}`;
  }
  
  baseName += `-${questionCount}-questions-${timestamp}`;
  
  return `${baseName}.${extension}`;
};