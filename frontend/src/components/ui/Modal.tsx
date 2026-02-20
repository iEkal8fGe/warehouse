import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  // Блокируем скролл body когда модалка открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { maxWidth: '400px' };
      case 'md': return { maxWidth: '600px' };
      case 'lg': return { maxWidth: '800px' };
      case 'xl': return { maxWidth: '1000px' };
      default: return { maxWidth: '600px' };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={getSizeStyles()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 16px;
            animation: fadeIn 0.3s ease;
          }

          .modal-content {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--radius);
            overflow: hidden;
            animation: slideIn 0.3s ease;
            display: flex;
            flex-direction: column;
            max-height: calc(100vh - 40px);
          }

          .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
          }

          .modal-title {
            margin: 0;
            color: white;
            font-size: 1.25rem;
          }

          .modal-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            transition: var(--transition);
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
          }

          .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }

          .modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
          }

          .modal-footer {
            padding: 20px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            flex-shrink: 0;
          }

          /* Стили для скроллбара внутри модалки */
          .modal-body::-webkit-scrollbar {
            width: 6px;
          }

          .modal-body::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }

          .modal-body::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          .modal-body::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          @media (max-width: 768px) {
            .modal-content {
              max-width: 100% !important;
              max-height: calc(100vh - 32px);
            }

            .modal-header {
              padding: 16px;
            }

            .modal-body {
              padding: 16px;
            }

            .modal-footer {
              padding: 16px;
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};