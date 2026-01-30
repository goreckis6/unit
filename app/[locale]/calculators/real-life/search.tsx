'use client';

interface SearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
  placeholder: string;
  resultsText: string;
  noResultsText: string;
  noResultsHint: string;
}

export function CalculatorSearch({
  searchQuery,
  onSearchChange,
  resultsCount,
  placeholder,
  resultsText,
}: SearchProps) {
  return (
    <div className="search-section">
      <div className="search-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className="clear-search" aria-label="Clear search">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="search-results-count">
          {resultsCount} {resultsText}
        </div>
      )}
    </div>
  );
}
