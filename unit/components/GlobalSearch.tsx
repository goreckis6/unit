'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getAllCalculators } from '@/lib/all-calculators';
import type { SearchableCalculator } from '@/lib/get-searchable-calculators';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  categoryLabel: string;
}

interface GlobalSearchProps {
  /** Pre-fetched calculators (static + CMS). When provided, CMS calculators appear in search. */
  calculators?: SearchableCalculator[];
}

export function GlobalSearch({ calculators: propCalculators }: GlobalSearchProps = {}) {
  const t = useTranslations('calculators');
  const tHome = useTranslations('common.homePage');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCalculators = useMemo((): SearchResult[] => {
    if (propCalculators && propCalculators.length > 0) {
      return propCalculators;
    }
    const staticCalcs = getAllCalculators();
    const catBadge = (cat: string) => {
      const map: Record<string, string> = {
        math: t('mathCalculators.badge') || 'Math',
        electric: t('electricCalculators.badge') || 'Electric',
        biology: t('biologyCalculators.badge') || 'Biology',
        conversion: t('conversionCalculators.badge') || 'Conversion',
        physics: t('physicsCalculators.badge') || 'Physics',
        'real-life': t('realLifeCalculators.badge') || 'Real-life',
        finance: t('financeCalculators.badge') || 'Finance',
        others: t('otherCalculators.badge') || 'Others',
        health: t('healthCalculators.badge') || 'Health',
        chemistry: t('chemistryCalculators.badge') || 'Chemistry',
        construction: t('constructionCalculators.badge') || 'Construction',
        ecology: t('ecologyCalculators.badge') || 'Ecology',
        food: t('foodCalculators.badge') || 'Food',
        statistics: t('statisticsCalculators.badge') || 'Statistics',
      };
      return map[cat] ?? cat;
    };
    return staticCalcs.map((c) => {
      let title = c.id;
      let description = '';
      try {
        title = t(c.titleKey) || c.id;
        description = t(c.descKey) || '';
      } catch {
        // MISSING_MESSAGE fallback — use id if t() throws (e.g. armyBodyFat missing in locale)
      }
      return {
        id: c.id,
        title,
        description,
        path: c.path.startsWith('/') ? c.path : `/${c.path}`,
        categoryLabel: catBadge(c.category),
      };
    });
  }, [propCalculators, t]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return allCalculators
      .filter((c) => (c.title ?? '').toLowerCase().includes(query) || (c.description ?? '').toLowerCase().includes(query))
      .slice(0, 10);
  }, [searchQuery, allCalculators]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const handleResultClick = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="global-search" ref={searchRef}>
      <div className="global-search-wrapper">
        <svg className="global-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={tHome('searchPlaceholder') || 'Search all calculators...'}
          className="global-search-input"
        />
        {searchQuery && (
          <button
            onClick={() => handleInputChange('')}
            className="global-search-clear"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      {isOpen && filteredResults.length > 0 && (
        <div className="global-search-results">
          <div className="global-search-results-header">
            {filteredResults.length} {tHome('searchResultsFound') || 'results found'}
          </div>
          {filteredResults.map((result) => (
            <Link
              key={result.id}
              href={result.path}
              className="global-search-result-item"
              onClick={handleResultClick}
            >
              <div className="global-search-result-content">
                <div className="global-search-result-header">
                  <h3 className="global-search-result-title">{result.title}</h3>
                  <span className="global-search-result-badge">{result.categoryLabel}</span>
                </div>
              </div>
              <div className="global-search-result-arrow">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && searchQuery.trim() && filteredResults.length === 0 && (
        <div className="global-search-no-results">
          <svg className="global-search-no-results-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="global-search-no-results-text">{tHome('searchNoResults') || 'No results found'}</p>
          <p className="global-search-no-results-hint">{tHome('searchTryDifferent') || 'Try a different search term'}</p>
        </div>
      )}
    </div>
  );
}
