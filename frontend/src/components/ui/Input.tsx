import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="input-wrapper">
        {label && <label className="input-label">{label}</label>}
        <div className="input-container">
          {icon && <span className="input-icon">{icon}</span>}
          <input
            ref={ref}
            className={`input ${icon ? 'with-icon' : ''} ${error ? 'error' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="input-error">{error}</span>}

        <style>{`
        .input-wrapper {
          width: 100%;
        }
        .input-label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }
        .input-container {
          position: relative;
          width: 100%;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
        }
        .input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-sm);
          color: white;
          font-size: 1rem;
          transition: var(--transition);
          backdrop-filter: blur(10px);
        }
        .input.with-icon {
          padding-left: 48px;
        }
        .input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.15);
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .input.error {
          border-color: var(--danger);
        }
        .input-error {
          display: block;
          margin-top: 4px;
          color: var(--danger);
          font-size: 0.875rem;
        }
      `}</style>
      </div>
    );
  }
);

// export const Input: React.FC<InputProps> = ({
//   label,
//   error,
//   icon,
//   className = '',
//   ...props
// }) => {
//   return (
//     <div className="input-wrapper">
//       {label && <label className="input-label">{label}</label>}
//       <div className="input-container">
//         {icon && <span className="input-icon">{icon}</span>}
//         <input
//           className={`input ${icon ? 'with-icon' : ''} ${error ? 'error' : ''} ${className}`}
//           {...props}
//         />
//       </div>
//       {error && <span className="input-error">{error}</span>}
//
//       <style>{`
//         .input-wrapper {
//           width: 100%;
//         }
//         .input-label {
//           display: block;
//           margin-bottom: 8px;
//           color: rgba(255, 255, 255, 0.9);
//           font-weight: 500;
//         }
//         .input-container {
//           position: relative;
//           width: 100%;
//         }
//         .input-icon {
//           position: absolute;
//           left: 16px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: rgba(255, 255, 255, 0.5);
//         }
//         .input {
//           width: 100%;
//           padding: 14px 16px;
//           background: rgba(255, 255, 255, 0.1);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//           border-radius: var(--radius-sm);
//           color: white;
//           font-size: 1rem;
//           transition: var(--transition);
//           backdrop-filter: blur(10px);
//         }
//         .input.with-icon {
//           padding-left: 48px;
//         }
//         .input:focus {
//           outline: none;
//           border-color: var(--primary);
//           background: rgba(255, 255, 255, 0.15);
//         }
//         .input::placeholder {
//           color: rgba(255, 255, 255, 0.4);
//         }
//         .input.error {
//           border-color: var(--danger);
//         }
//         .input-error {
//           display: block;
//           margin-top: 4px;
//           color: var(--danger);
//           font-size: 0.875rem;
//         }
//       `}</style>
//     </div>
//   );
// };