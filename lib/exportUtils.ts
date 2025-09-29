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
export const exportToPDF = async (questions: Question[], options: ExportOptions = {}) => {
  const {
    filename = 'questions-export.pdf',
    title = 'Interview Questions',
    includeMetadata = true
  } = options;

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.4; // Adjust line height
    
    for (let i = 0; i < lines.length; i++) {
      const currentY = y + (i * lineHeight);
      if (currentY > pageHeight - margin) {
        doc.addPage();
        y = margin;
        doc.text(lines[i], x, margin + (i * lineHeight));
      } else {
        doc.text(lines[i], x, currentY);
      }
    }
    
    return y + (lines.length * lineHeight) + 5; // Return new y position with spacing
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = addWrappedText(title, margin, yPosition + 10, maxWidth, 20);
  
  // Metadata
  if (includeMetadata) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const metadata = [
      `Total Questions: ${questions.length}`,
      `Export Date: ${new Date().toLocaleDateString()}`,
      `Export Time: ${new Date().toLocaleTimeString()}`
    ];
    
    metadata.forEach(line => {
      yPosition = addWrappedText(line, margin, yPosition + 5, maxWidth, 10);
    });
    yPosition += 10;
  }

  // Questions
  questions.forEach((question, index) => {
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = margin;
    }

    // Question number and type
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const questionHeader = `Question ${index + 1} - ${QuestionTypeUtils.getDisplayName(question.type)}`;
    yPosition = addWrappedText(questionHeader, margin, yPosition + 10, maxWidth, 14);

    // Programming language (if available)
    if (question.programming_language) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      yPosition = addWrappedText(`Language: ${question.programming_language}`, margin, yPosition, maxWidth, 10);
    }

    // Context (if available)
    if (question.context && question.context.trim()) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      yPosition = addWrappedText('Context:', margin, yPosition + 5, maxWidth, 10);
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText(question.context, margin, yPosition, maxWidth, 10);
    }

    // Question
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    yPosition = addWrappedText('Question:', margin, yPosition + 5, maxWidth, 10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(question.question, margin, yPosition, maxWidth, 10);

    // Answer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    yPosition = addWrappedText('Answer:', margin, yPosition + 5, maxWidth, 10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(question.answer, margin, yPosition, maxWidth, 10);

    yPosition += 15; // Space between questions
  });

  // Save the PDF
  doc.save(filename);
};

/**
 * Export questions to XLSX format
 */
export const exportToXLSX = (questions: Question[], options: ExportOptions = {}) => {
  const {
    filename = 'questions-export.xlsx',
    title = 'Interview Questions'
  } = options;

  // Prepare data for Excel
  const data = questions.map((question, index) => ({
    'Question #': index + 1,
    'Type': QuestionTypeUtils.getDisplayName(question.type),
    'Programming Language': question.programming_language || '',
    'Context': question.context || '',
    'Question': question.question,
    'Answer': question.answer,
    'Created Date': new Date(question.created_at).toLocaleDateString(),
    'Updated Date': new Date(question.updated_at).toLocaleDateString(),
    'Global': question.global ? 'Yes' : 'No'
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
    { wch: 10 }  // Global
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
export const exportToDOCX = async (questions: Question[], options: ExportOptions = {}) => {
  const {
    filename = 'questions-export.docx',
    title = 'Interview Questions',
    includeMetadata = true
  } = options;

  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 }
    })
  );

  // Metadata
  if (includeMetadata) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total Questions: ${questions.length}`,
            break: 1
          }),
          new TextRun({
            text: `Export Date: ${new Date().toLocaleDateString()}`,
            break: 1
          }),
          new TextRun({
            text: `Export Time: ${new Date().toLocaleTimeString()}`,
            break: 1
          })
        ],
        spacing: { after: 400 }
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
            text: `Question ${index + 1} - ${QuestionTypeUtils.getDisplayName(question.type)}`,
            bold: true,
            size: 28
          })
        ],
        spacing: { before: 240, after: 120 }
      })
    );

    // Programming language
    if (question.programming_language) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Language: ${question.programming_language}`,
              italics: true
            })
          ],
          spacing: { after: 120 }
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
              bold: true
            }),
            new TextRun({
              text: question.context
            })
          ],
          spacing: { after: 120 }
        })
      );
    }

    // Question
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Question: ',
            bold: true
          }),
          new TextRun({
            text: question.question
          })
        ],
        spacing: { after: 120 }
      })
    );

    // Answer
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Answer: ',
            bold: true
          }),
          new TextRun({
            text: question.answer
          })
        ],
        spacing: { after: 240 }
      })
    );
  });

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
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