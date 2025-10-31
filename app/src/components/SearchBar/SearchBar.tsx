import React from 'react';
import './SearchBar.css';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onAddClick 
}) => {
  return (
    <div className="search-section">
      <input
        type="text"
        placeholder="Search documents..."
        value={searchTerm}
        onChange={onSearchChange}
        data-testid="search-input"
      />
      <button onClick={onAddClick} data-testid="add-document-btn">
        Add New Document
      </button>
    </div>
  );
};

export default SearchBar;