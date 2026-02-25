'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CalculatorSearch } from './search';

interface Calculator {
  id: string;
  title: string;
  description: string;
  path: string;
}

interface CalculatorListProps {
  calculators: Calculator[];
}

export function CalculatorList({ calculators }: CalculatorListProps) {
  const t = useTranslations('calculators');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = useMemo(() => {
    if (!searchQuery.trim()) {
      return calculators.map(calc => ({
        id: calc.id,
        title: calc.title,
        description: calc.description,
        path: calc.path,
      }));
    }
    
    const query = searchQuery.toLowerCase().trim();
    return calculators
      .filter(calc => {
        const title = calc.title.toLowerCase();
        const description = calc.description.toLowerCase();
        return title.includes(query) || description.includes(query);
      })
      .map(calc => ({
        id: calc.id,
        title: calc.title,
        description: calc.description,
        path: calc.path,
      }));
  }, [searchQuery, calculators]);

  return (
    <>
      <CalculatorSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultsCount={filteredCalculators.length}
        placeholder={t('otherCalculators.searchPlaceholder') || 'Search calculators...'}
        resultsText={t('otherCalculators.resultsFound') || 'results found'}
        noResultsText={t('otherCalculators.noResults') || 'No results found'}
        noResultsHint={t('otherCalculators.tryDifferentSearch') || 'Try a different search term'}
      />

      {/* Calculators List */}
      <div className="calculators-list">
        {filteredCalculators.map((calc) => (
          <Link 
            key={calc.id}
            href={calc.path} 
            className="calculator-list-item"
          >
            <div className="calculator-content">
              <h3 className="calculator-name">{calc.title}</h3>
              <p className="calculator-description">{calc.description}</p>
            </div>
            <div className="calculator-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        ))}

        {filteredCalculators.length === 0 && (
          <div className="no-results">
            <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="no-results-text">{t('otherCalculators.noResults') || 'No results found'}</p>
            <p className="no-results-hint">{t('otherCalculators.tryDifferentSearch') || 'Try a different search term'}</p>
          </div>
        )}
      </div>
    </>
  );
}
