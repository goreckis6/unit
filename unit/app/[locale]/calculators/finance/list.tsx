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
  pageId?: string;
}

interface CalculatorListProps {
  calculators: Calculator[];
  isAdmin?: boolean;
}

export function CalculatorList({ calculators, isAdmin }: CalculatorListProps) {
  const t = useTranslations('calculators');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = useMemo(() => {
    if (!searchQuery.trim()) {
      return calculators.map(calc => ({
        id: calc.id,
        title: calc.title,
        description: calc.description,
        path: calc.path,
        pageId: calc.pageId,
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
        pageId: calc.pageId,
      }));
  }, [searchQuery, calculators]);

  return (
    <>
      <CalculatorSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultsCount={filteredCalculators.length}
        placeholder={t('financeCalculators.searchPlaceholder') || 'Search calculators...'}
        resultsText={t('financeCalculators.resultsFound') || 'results found'}
        noResultsText={t('financeCalculators.noResults') || 'No results found'}
        noResultsHint={t('financeCalculators.tryDifferentSearch') || 'Try a different search term'}
      />

      <div className="calculators-list">
        {filteredCalculators.map((calc) => (
          <div key={calc.id} className="calculator-list-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href={calc.path} style={{ flex: 1, display: 'contents' }}>
              <div className="calculator-content" style={{ flex: 1 }}>
                <h3 className="calculator-name">{calc.title}</h3>
                <p className="calculator-description">{calc.description}</p>
              </div>
              <div className="calculator-arrow">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
            {isAdmin && calc.pageId && (
              <a
                href={`/twojastara/pages/${calc.pageId}/edit`}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                Edit
              </a>
            )}
          </div>
        ))}

        {filteredCalculators.length === 0 && (
          <div className="no-results">
            <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="no-results-text">{t('financeCalculators.noResults') || 'No results found'}</p>
            <p className="no-results-hint">{t('financeCalculators.tryDifferentSearch') || 'Try a different search term'}</p>
          </div>
        )}
      </div>
    </>
  );
}
