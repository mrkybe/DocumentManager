import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  isConfirmDialog?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  isConfirmDialog = false 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal ${isConfirmDialog ? 'confirm-dialog' : ''}`} data-testid="modal">
        {isConfirmDialog ? (
          <h3 data-testid="modal-title">{title}</h3>
        ) : (
          <h2 data-testid="modal-title">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;