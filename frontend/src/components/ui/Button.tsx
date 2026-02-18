import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: 'white',
          border: 'none',
        };
      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, var(--danger) 0%, #dc2626 100%)',
          color: 'white',
          border: 'none',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'white',
          border: 'none',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '8px 16px', fontSize: '0.875rem' };
      case 'md':
        return { padding: '12px 24px', fontSize: '1rem' };
      case 'lg':
        return { padding: '16px 32px', fontSize: '1.125rem' };
      default:
        return {};
    }
  };

  const styles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    width: fullWidth ? '100%' : 'auto',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontWeight: 500,
    backdropFilter: variant === 'secondary' ? 'blur(10px)' : 'none',
  };

  return (
    <button
      className={`button ${className}`}
      style={styles}
      {...props}
    >
      {children}
      <style>{`
        .button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          opacity: 0.9;
        }
        .button:active {
          transform: translateY(0);
        }
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
};