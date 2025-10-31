import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onDismiss }) => {
  return (
    <div className="error-message" data-testid="error-message">
      {error}
      <button onClick={onDismiss}>×</button>
    </div>
  );
};

export default ErrorMessage;