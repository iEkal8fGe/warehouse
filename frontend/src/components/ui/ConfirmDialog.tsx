import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={32} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={32} color="#f59e0b" />;
      default:
        return <AlertTriangle size={32} color="#3b82f6" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '12px 0'
      }}>
        <div style={{ flexShrink: 0 }}>
          {getIcon()}
        </div>
        <p style={{
          color: 'white',
          margin: 0,
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};