import React from 'react';
import './DocumentList.css';
import DocumentItem from '../DocumentItem/DocumentItem';

interface Document {
  Title: string;
  Content: string;
  Author: string;
  Date: string;
  Status: 'Live' | 'Preview' | 'Draft' | 'Retracted';
}

interface DocumentListProps {
  documents: Document[];
  filteredDocuments: Document[];
  searchTerm: string;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents,
  filteredDocuments, 
  searchTerm, 
  onEdit, 
  onDelete 
}) => {
  return (
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
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })
      )}
    </div>
  );
};

export default DocumentList;