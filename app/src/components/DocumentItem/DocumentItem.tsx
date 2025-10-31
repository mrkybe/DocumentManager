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
      {/* Main Content Area */}
      <div className="content-area">
        {/* Title and Status Section */}
        <div className="title-container">
          <span className={`status ${document.Status.toLowerCase()}`}>
            {document.Status.toUpperCase()}
          </span>
          <h3 className="document-title">{document.Title}</h3>
        </div>

        {/* Meta Information */}
        <div className="meta-container">
          <div className="author-container">
            <span className="meta-label">Author:</span>
            <span className="meta-value">{document.Author}</span>
          </div>
          <div className="date-container">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{document.Date}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-container">
          <p className="document-content">{document.Content}</p>
        </div>
      </div>

      {/* Actions Section */}
      <div className="actions-container">
        <button 
          onClick={() => onEdit(index)}
          data-testid="edit-btn"
          className="edit-btn"
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
  );
};

export default DocumentItem;