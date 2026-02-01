'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

type ConversionDirection = 'dna-to-mrna' | 'mrna-to-dna';

// DNA to mRNA base pairing: A->U, T->A, C->G, G->C
function dnaToMrna(dna: string): string {
  const mapping: Record<string, string> = {
    'A': 'U',
    'T': 'A',
    'C': 'G',
    'G': 'C',
    'a': 'U',
    't': 'A',
    'c': 'G',
    'g': 'C',
  };
  
  return dna
    .split('')
    .map(char => mapping[char] || char)
    .join('');
}

// mRNA to DNA base pairing: U->T, A->T, G->C, C->G
function mrnaToDna(mrna: string): string {
  const mapping: Record<string, string> = {
    'U': 'T',
    'A': 'T',
    'G': 'C',
    'C': 'G',
    'u': 'T',
    'a': 'T',
    'g': 'C',
    'c': 'G',
  };
  
  return mrna
    .split('')
    .map(char => mapping[char] || char)
    .join('');
}

// RNA codon to amino acid mapping
const codonToAminoAcid: Record<string, string> = {
  'UUU': 'PHE', 'UUC': 'PHE',
  'UUA': 'LEU', 'UUG': 'LEU', 'CUU': 'LEU', 'CUC': 'LEU', 'CUA': 'LEU', 'CUG': 'LEU',
  'AUU': 'ILE', 'AUC': 'ILE', 'AUA': 'ILE',
  'AUG': 'MET',
  'GUU': 'VAL', 'GUC': 'VAL', 'GUA': 'VAL', 'GUG': 'VAL',
  'UCU': 'SER', 'UCC': 'SER', 'UCA': 'SER', 'UCG': 'SER', 'AGU': 'SER', 'AGC': 'SER',
  'CCU': 'PRO', 'CCC': 'PRO', 'CCA': 'PRO', 'CCG': 'PRO',
  'ACU': 'THR', 'ACC': 'THR', 'ACA': 'THR', 'ACG': 'THR',
  'GCU': 'ALA', 'GCC': 'ALA', 'GCA': 'ALA', 'GCG': 'ALA',
  'UAU': 'TYR', 'UAC': 'TYR',
  'UAA': 'STOP', 'UAG': 'STOP', 'UGA': 'STOP',
  'CAU': 'HIS', 'CAC': 'HIS',
  'CAA': 'GLN', 'CAG': 'GLN',
  'AAU': 'ASN', 'AAC': 'ASN',
  'AAA': 'LYS', 'AAG': 'LYS',
  'GAU': 'ASP', 'GAC': 'ASP',
  'GAA': 'GLU', 'GAG': 'GLU',
  'UGU': 'CYS', 'UGC': 'CYS',
  'UGG': 'TRP',
  'CGU': 'ARG', 'CGC': 'ARG', 'CGA': 'ARG', 'CGG': 'ARG', 'AGA': 'ARG', 'AGG': 'ARG',
  'GGU': 'GLY', 'GGC': 'GLY', 'GGA': 'GLY', 'GGG': 'GLY',
};

function translateToProtein(mrna: string): string {
  // Remove spaces and convert to uppercase
  const cleanMrna = mrna.replace(/\s+/g, '').toUpperCase();
  
  if (cleanMrna.length < 3) return '';
  
  const aminoAcids: string[] = [];
  
  // Read codons (groups of 3 bases)
  for (let i = 0; i < cleanMrna.length - 2; i += 3) {
    const codon = cleanMrna.substring(i, i + 3);
    
    // Check if codon contains only valid RNA bases
    if (!/^[AUCG]+$/.test(codon)) {
      continue;
    }
    
    const aminoAcid = codonToAminoAcid[codon];
    if (aminoAcid) {
      if (aminoAcid === 'STOP') {
        break; // Stop translation at stop codon
      }
      aminoAcids.push(aminoAcid);
    }
  }
  
  return aminoAcids.join('-');
}

function formatSequence(sequence: string, groupSize: number = 3): string {
  // Remove all spaces first
  const clean = sequence.replace(/\s+/g, '');
  
  // Group characters with spaces
  const groups: string[] = [];
  for (let i = 0; i < clean.length; i += groupSize) {
    groups.push(clean.substring(i, i + groupSize));
  }
  
  return groups.join(' ');
}

export function DnaToMrnaConverter() {
  const t = useTranslations('calculators.dnaToMrna');
  const [direction, setDirection] = useState<ConversionDirection>('dna-to-mrna');
  const [inputSequence, setInputSequence] = useState<string>('');
  const [dnaSequence, setDnaSequence] = useState<string>('');
  const [mrnaSequence, setMrnaSequence] = useState<string>('');
  const [proteinSequence, setProteinSequence] = useState<string>('');

  // Auto-convert when input or direction changes
  useEffect(() => {
    if (!inputSequence.trim()) {
      setDnaSequence('');
      setMrnaSequence('');
      setProteinSequence('');
      return;
    }

    // Clean input: remove spaces, numbers, punctuation, keep only A, T, C, G, U
    const cleanInput = inputSequence
      .replace(/\s+/g, '')
      .toUpperCase()
      .replace(/[^ATCGU]/g, '');

    if (direction === 'dna-to-mrna') {
      // Input is DNA
      const dna = cleanInput.replace(/U/g, 'T'); // Convert any U to T in DNA
      const mrna = dnaToMrna(dna);
      const protein = translateToProtein(mrna);
      
      setDnaSequence(dna);
      setMrnaSequence(mrna);
      setProteinSequence(protein);
    } else {
      // Input is mRNA
      const mrna = cleanInput.replace(/T/g, 'U'); // Convert any T to U in mRNA
      const dna = mrnaToDna(mrna);
      const protein = translateToProtein(mrna);
      
      setDnaSequence(dna);
      setMrnaSequence(mrna);
      setProteinSequence(protein);
    }
  }, [inputSequence, direction]);

  const handleReset = () => {
    setInputSequence('');
    setDnaSequence('');
    setMrnaSequence('');
    setProteinSequence('');
  };

  const copyText = (text: string) => text ? text.replace(/\s+/g, '') : '';

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="direction" className="input-label">
                {t('directionLabel')}
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setDirection('dna-to-mrna')}
                  className={`btn ${direction === 'dna-to-mrna' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: '1', minWidth: '200px' }}
                >
                  {t('dnaToMrna')}
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('mrna-to-dna')}
                  className={`btn ${direction === 'mrna-to-dna' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: '1', minWidth: '200px' }}
                >
                  {t('mrnaToDna')}
                </button>
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="sequence" className="input-label">
                {direction === 'dna-to-mrna' ? t('inputDnaSequence') : t('inputMrnaSequence')}
              </label>
              <div
                className="number-input"
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--surface-secondary, #f5f5f5)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #e0e0e0)',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {t('exampleLabel')} {t('exampleInput')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'monospace' }}>
                  <span>
                    {t('dnaSequence')}: {t('exampleDna')}
                  </span>
                  <span>
                    {t('mrnaSequence')}: {t('exampleMrna')}
                  </span>
                  <span>
                    {t('proteinSequence')}: {t('exampleProtein')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInputSequence('ACGT')}
                  className="btn btn-secondary"
                  style={{ marginTop: '0.75rem', minHeight: '36px' }}
                >
                  {t('useExample')}
                </button>
              </div>
              <textarea
                id="sequence"
                value={inputSequence}
                onChange={(e) => setInputSequence(e.target.value)}
                className="number-input"
                placeholder={direction === 'dna-to-mrna' ? t('dnaPlaceholder') : t('mrnaPlaceholder')}
                rows={8}
                style={{
                  resize: 'vertical',
                  minHeight: '200px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '1.05em',
                  letterSpacing: '0.08em',
                }}
              />
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Outputs */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label className="input-label">{t('dnaSequence')}</label>
              {dnaSequence ? (
                <div
                  className="number-input"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.05em',
                    letterSpacing: '0.08em',
                    padding: '1.25rem',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <span style={{ flex: 1 }}>{formatSequence(dnaSequence)}</span>
                  <CopyButton text={copyText(dnaSequence)} className="btn btn-primary" />
                </div>
              ) : (
                <div
                  className="number-input"
                  style={{
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    padding: '1.25rem',
                    opacity: 0.5,
                    textAlign: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {direction === 'dna-to-mrna' ? t('dnaPlaceholder') : t('inputDnaSequence')}
                  </span>
                </div>
              )}
            </div>

            <div className="input-card">
              <label className="input-label">{t('mrnaSequence')}</label>
              {mrnaSequence ? (
                <div
                  className="number-input"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.05em',
                    letterSpacing: '0.08em',
                    padding: '1.25rem',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <span style={{ flex: 1 }}>{formatSequence(mrnaSequence)}</span>
                  <CopyButton text={copyText(mrnaSequence)} className="btn btn-primary" />
                </div>
              ) : (
                <div
                  className="number-input"
                  style={{
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    padding: '1.25rem',
                    opacity: 0.5,
                    textAlign: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {direction === 'dna-to-mrna' ? t('inputMrnaSequence') : t('mrnaPlaceholder')}
                  </span>
                </div>
              )}
            </div>

            <div className="input-card">
              <label className="input-label">{t('proteinSequence')}</label>
              {proteinSequence ? (
                <div
                  className="number-input"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.05em',
                    padding: '1.25rem',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <span style={{ flex: 1 }}>{proteinSequence}</span>
                  <CopyButton text={copyText(proteinSequence)} className="btn btn-primary" />
                </div>
              ) : (
                <div
                  className="number-input"
                  style={{
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    padding: '1.25rem',
                    opacity: 0.5,
                    textAlign: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{t('results')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
