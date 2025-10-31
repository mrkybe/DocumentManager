import React, { useState, useEffect, useCallback } from 'react';
import './DocumentApp.css';
import SearchBar from './components/SearchBar/SearchBar';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import DocumentItem from './components/DocumentItem/DocumentItem';

interface Document {
  Title: string;
  Content: string;
  Author: string;
  Date: string;
  Status: 'Live' | 'Preview' | 'Draft' | 'Retracted';
}

const DocumentApp: React.FC = () => {
  // 1. Simple state for primitives
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Array state for complex data
  const [documents, setDocuments] = useState<Document[]>([]);

  // 3. Object state for forms/complex structures
  const [editingDocument, setEditingDocument] = useState<{
    index: number;
    document: Document;
  } | null>(null);

  // 4. Multiple related states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // ===== LOADING DATA WITH useEffect =====
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/documents.json');
        if (!response.ok) {
          throw new Error('Failed to load documents');
        }
        
        const data = await response.json();
        setDocuments(data.Documents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []); // Empty dependency array = run once on mount

  // ===== STATE UPDATE PATTERNS =====

  // 1. Adding to array state
  const addDocument = useCallback((newDoc: Omit<Document, 'Date'>) => {
    // Check for duplicates
    const isDuplicate = documents.some(doc => 
      doc.Title.toLowerCase() === newDoc.Title.toLowerCase()
    );

    if (isDuplicate) {
      setError('A document with this title already exists');
      return false;
    }

    const documentWithDate: Document = {
      ...newDoc,
      Date: new Date().toISOString().split('T')[0]
    };

    // Use functional update to ensure we get latest state
    setDocuments(prevDocs => [...prevDocs, documentWithDate]);
    setError(null);
    return true;
  }, [documents]);

  // 2. Updating array state (editing)
  const updateDocument = useCallback((index: number, updatedDoc: Document) => {
    setDocuments(prevDocs => 
      prevDocs.map((doc, i) => i === index ? updatedDoc : doc)
    );
    setEditingDocument(null);
  }, []);

  // 3. Removing from array state
  const deleteDocument = useCallback((index: number) => {
    setDocuments(prevDocs => prevDocs.filter((_, i) => i !== index));
    setShowDeleteConfirm(null);
  }, []);

  // 4. Computed state (derived from other state)
  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc =>
      doc.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.Author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  // ===== EVENT HANDLERS =====
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    setError(null);
  };

  const handleEditClick = (index: number) => {
    setEditingDocument({
      index,
      document: { ...documents[index] }
    });
  };

  const handleDeleteClick = (index: number) => {
    setShowDeleteConfirm(index);
  };

  // ===== RENDER =====
  if (loading) {
    return <div className="loading">Loading documents...</div>;
  }

  return (
    <div className="document-app">
      <h1 data-testid="page-title-header">Document Management System</h1>
      
      {error && (
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      {/* Documents List */}
      <div className="documents-list">
        <h2 data-testid="documents-header">
          Documents ({filteredDocuments.length}
          {searchTerm && ` of ${documents.length}`})
        </h2>
        
        {filteredDocuments.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          filteredDocuments.map((doc, originalIndex) => {
            // Find the original index in the unfiltered array
            const actualIndex = documents.findIndex(d => d === doc);
            
            return (
              <DocumentItem
                key={actualIndex}
                document={doc}
                index={actualIndex}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            );
          })
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal" data-testid="modal">
            <h2 data-testid="modal-title">Add New Document</h2>
            <SimpleAddForm
              onSubmit={(doc) => {
                const success = addDocument(doc);
                if (success) {
                  setShowAddForm(false);
                }
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingDocument && (
        <div className="modal-overlay">
          <div className="modal" data-testid="modal">
            <h2 data-testid="modal-title">Edit Document</h2>
            <EditForm
              document={editingDocument.document}
              onSubmit={(doc) => updateDocument(editingDocument.index, doc)}
              onCancel={() => setEditingDocument(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm !== null && (
        <div className="modal-overlay">
          <div className="modal confirm-dialog" data-testid="modal">
            <h3 data-testid="modal-title">Confirm Delete</h3>
            <p>Are you sure you want to delete "{documents[showDeleteConfirm]?.Title}"?</p>
            <div className="dialog-actions">
              <button 
                onClick={() => deleteDocument(showDeleteConfirm)}
                data-testid="confirm-delete"
                className="delete-btn"
              >
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} data-testid="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== FORM COMPONENTS =====
interface FormProps {
  onSubmit: (doc: Omit<Document, 'Date'>) => void;
  onCancel: () => void;
}

interface EditFormProps {
  document: Document;
  onSubmit: (doc: Document) => void;
  onCancel: () => void;
}

const SimpleAddForm: React.FC<FormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    Title: '',
    Content: '',
    Author: '',
    Status: 'Draft' as Document['Status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Title.trim() || !formData.Content.trim() || !formData.Author.trim()) {
      alert('Please fill in all fields');
      return;
    }

    onSubmit({
      Title: formData.Title.trim(),
      Content: formData.Content.trim(),
      Author: formData.Author.trim(),
      Status: formData.Status
    });
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
      
      <div className="form-actions">
        <button type="submit" data-testid="save-btn">
          Save Document
        </button>
        <button type="button" onClick={onCancel} data-testid="cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
};

const EditForm: React.FC<EditFormProps> = ({ document, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    Title: document.Title,
    Content: document.Content,
    Author: document.Author,
    Status: document.Status,
    Date: document.Date
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
      
      <div className="form-group">
        <label>Date:</label>
        <input
          type="date"
          value={formData.Date}
          onChange={handleChange('Date')}
          data-testid="date-input"
        />
      </div>
      
      <div className="form-actions">
        <button type="submit" data-testid="save-btn">
          Update Document
        </button>
        <button type="button" onClick={onCancel} data-testid="cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DocumentApp;