import React from 'react';
import './DocumentItem.css';

interface Document {
  Title: string;
  Content: string;
  Author: string;
  Date: string;
  Status: 'Live' | 'Preview' | 'Draft' | 'Retracted';
}

interface DocumentItemProps {
  document: Document;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ 
  document, 
  index, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="document-item" data-testid="document-item">
      <div className="document-header">
        <div className="document-title-section">
          <h3>{document.Title}</h3>
          <div className="document-meta">
            <span>
              <strong>Author:</strong> {document.Author}
            </span>
            <span>
              <strong>Date:</strong> {document.Date}
            </span>
            <span>
              <strong>Status:</strong>
              <span className={`status ${document.Status.toLowerCase()}`}>
                {document.Status}
              </span>
            </span>
          </div>
        </div>
        <div className="document-actions">
          <button 
            onClick={() => onEdit(index)}
            data-testid="edit-btn"
            title="Edit document"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(index)}
            data-testid="delete-btn"
            className="delete-btn"
            title="Delete document"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="document-content">{document.Content}</p>
    </div>
  );
};

export default DocumentItem;