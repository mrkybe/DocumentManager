import React, { useState } from 'react';
import './DocumentForm.css';

interface Document {
  Title: string;
  Content: string;
  Author: string;
  Date: string;
  Status: 'Live' | 'Preview' | 'Draft' | 'Retracted';
}

interface DocumentFormProps {
  initialDocument?: Partial<Document>;
  mode: 'add' | 'edit';
  onSubmit: (doc: Document | Omit<Document, 'Date'>) => void;
  onCancel: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ 
  initialDocument, 
  mode, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    Title: initialDocument?.Title || '',
    Content: initialDocument?.Content || '',
    Author: initialDocument?.Author || '',
    Status: (initialDocument?.Status || 'Draft') as Document['Status'],
    Date: initialDocument?.Date || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate for add mode (edit mode assumes valid existing data)
    if (mode === 'add') {
      if (!formData.Title.trim() || !formData.Content.trim() || !formData.Author.trim()) {
        alert('Please fill in all fields');
        return;
      }

      // For add mode, don't include Date in the submission
      onSubmit({
        Title: formData.Title.trim(),
        Content: formData.Content.trim(),
        Author: formData.Author.trim(),
        Status: formData.Status
      });
    } else {
      // For edit mode, include all fields including Date
      onSubmit({
        Title: formData.Title.trim(),
        Content: formData.Content.trim(),
        Author: formData.Author.trim(),
        Status: formData.Status,
        Date: formData.Date
      });
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="document-form">
      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          value={formData.Title}
          onChange={handleChange('Title')}
          data-testid="title-input"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Content:</label>
        <textarea
          value={formData.Content}
          onChange={handleChange('Content')}
          data-testid="content-input"
          rows={4}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Author:</label>
        <input
          type="text"
          value={formData.Author}
          onChange={handleChange('Author')}
          data-testid="author-input"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Status:</label>
        <select
          value={formData.Status}
          onChange={handleChange('Status')}
          data-testid="status-select"
        >
          <option value="Draft">Draft</option>
          <option value="Preview">Preview</option>
          <option value="Live">Live</option>
          <option value="Retracted">Retracted</option>
        </select>
      </div>
      
      {mode === 'edit' && (
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={formData.Date}
            onChange={handleChange('Date')}
            data-testid="date-input"
          />
        </div>
      )}
      
      <div className="form-actions">
        <button type="submit" data-testid="save-btn">
          {mode === 'add' ? 'Save Document' : 'Update Document'}
        </button>
        <button type="button" onClick={onCancel} data-testid="cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DocumentForm;