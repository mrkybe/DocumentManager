import React, { useState, useEffect, useCallback } from 'react';
import './DocumentApp.css';
import SearchBar from './components/SearchBar/SearchBar';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import DocumentList from './components/DocumentList/DocumentList';
import Modal from './components/Modal/Modal';
import DocumentForm from './components/DocumentForm/DocumentForm';

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
  const [formError, setFormError] = useState<string | null>(null);

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
        
        const response = await fetch(`${process.env.PUBLIC_URL}/documents.json`);
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
      setFormError('A document with this title already exists');
      return false;
    }

    const documentWithDate: Document = {
      ...newDoc,
      Date: new Date().toISOString().split('T')[0]
    };

    // Use functional update to ensure we get latest state
    setDocuments(prevDocs => [...prevDocs, documentWithDate]);
    setFormError(null);
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
    setFormError(null);
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

      <DocumentList
        documents={documents}
        filteredDocuments={filteredDocuments}
        searchTerm={searchTerm}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add Form Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setFormError(null);
        }}
        title="Add New Document"
      >
        <DocumentForm
          mode="add"
          error={formError}
          onSubmit={(doc) => {
            const success = addDocument(doc as Omit<Document, 'Date'>);
            if (success) {
              setShowAddForm(false);
            }
          }}
          onCancel={() => {
            setShowAddForm(false);
            setFormError(null);
          }}
        />
      </Modal>

      {/* Edit Form Modal */}
      <Modal
        isOpen={!!editingDocument}
        onClose={() => setEditingDocument(null)}
        title="Edit Document"
      >
        {editingDocument && (
          <DocumentForm
            mode="edit"
            initialDocument={editingDocument.document}
            onSubmit={(doc) => updateDocument(editingDocument.index, doc as Document)}
            onCancel={() => setEditingDocument(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
        isConfirmDialog={true}
      >
        {showDeleteConfirm !== null && (
          <>
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
          </>
        )}
      </Modal>
    </div>
  );
};



export default DocumentApp;