'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg' 
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm sm:max-w-md';
      case 'md':
        return 'max-w-lg sm:max-w-xl';
      case 'lg':
        return 'max-w-full sm:max-w-2xl lg:max-w-4xl';
      case 'xl':
        return 'max-w-full sm:max-w-4xl lg:max-w-6xl';
      default:
        return 'max-w-full sm:max-w-2xl lg:max-w-4xl';
    }
  };

  return (
    <div
      className="modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`modal-content w-full ${getSizeClasses()} min-h-[50vh] sm:min-h-0 max-h-[95vh] sm:max-h-[90vh] overflow-hidden`}
      >
        <div className="bg-gray-900 shadow-2xl rounded-t-xl sm:rounded-xl flex flex-col min-h-[50vh] sm:min-h-0 max-h-[95vh] sm:max-h-[90vh] border border-gray-700">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 bg-gray-800 rounded-t-xl flex-shrink-0">
            <div className="min-w-0 flex-1 mr-4">
              <h2
                id="modal-title"
                className="text-lg sm:text-xl font-bold text-white truncate"
              >
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200 flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-900">
            <div className="max-w-none">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
