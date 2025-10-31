import React, { useState } from 'react';

interface Document {
  Title: string;
  Content: string;
  Author: string;
  Date: string;
  Status: 'Live' | 'Preview' | 'Draft' | 'Retracted';
}

interface AddDocumentFormProps {
  onAddDocument: (document: Omit<Document, 'Date'>) => boolean;
  onCancel: () => void;
}

const AddDocumentForm: React.FC<AddDocumentFormProps> = ({ onAddDocument, onCancel }) => {
  // Individual state for each form field
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [status, setStatus] = useState<Document['Status']>('Draft');

  // Alternative: You could use a single state object
  // const [formData, setFormData] = useState({
  //   title: '',
  //   content: '',
  //   author: '',
  //   status: 'Draft' as Document['Status']
  // });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newDocument = {
      Title: title.trim(),
      Content: content.trim(),
      Author: author.trim(),
      Status: status
    };

    // Try to add document (parent component handles duplicate check)
    const success = onAddDocument(newDocument);
    
    if (success) {
      // Clear form on success
      setTitle('');
      setContent('');
      setAuthor('');
      setStatus('Draft');
      onCancel(); // Close form
    }
  };

  return (
    <div className="add-document-form">
      <h2>Add New Document</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="title-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            data-testid="content-input"
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author:</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            data-testid="author-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Document['Status'])}
            data-testid="status-select"
          >
            <option value="Draft">Draft</option>
            <option value="Preview">Preview</option>
            <option value="Live">Live</option>
            <option value="Retracted">Retracted</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" data-testid="save-btn">
            Save Document
          </button>
          <button type="button" onClick={onCancel} data-testid="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDocumentForm;