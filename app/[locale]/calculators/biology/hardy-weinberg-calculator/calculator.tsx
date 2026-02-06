'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type InputMethod = 'genotype' | 'phenotype' | 'allele';

interface HardyWeinbergResult {
  p: number;
  q: number;
  p2: number;
  pq2: number;
  q2: number;
  n: number;
  aa: number;
  Aa: number;
  AA: number;
  chiSquare?: number;
  chiSquareResult?: 'equilibrium' | 'notEquilibrium';
  steps?: string[];
}

function calculateFromGenotypeCounts(AA: number, Aa: number, aa: number): HardyWeinbergResult {
  const n = AA + Aa + aa;
  if (n === 0) {
    throw new Error('Total population must be greater than 0');
  }
  
  const q = Math.sqrt(aa / n);
  const p = 1 - q;
  const p2 = p * p;
  const pq2 = 2 * p * q;
  const q2 = q * q;
  
  return {
    p,
    q,
    p2,
    pq2,
    q2,
    n,
    AA,
    Aa,
    aa,
  };
}

function calculateFromPhenotype(totalN: number, recessiveCount: number): HardyWeinbergResult {
  if (totalN === 0) {
    throw new Error('Total population must be greater than 0');
  }
  if (recessiveCount > totalN) {
    throw new Error('Recessive count cannot exceed total population');
  }
  
  const aa = recessiveCount;
  const q = Math.sqrt(aa / totalN);
  const p = 1 - q;
  const p2 = p * p;
  const pq2 = 2 * p * q;
  const q2 = q * q;
  
  // Calculate expected genotype counts
  const expectedAA = p2 * totalN;
  const expectedAa = pq2 * totalN;
  const expectedAaCount = totalN - aa - expectedAA;
  const AA = Math.max(0, expectedAaCount);
  const Aa = totalN - AA - aa;
  
  return {
    p,
    q,
    p2,
    pq2,
    q2,
    n: totalN,
    AA,
    Aa,
    aa,
  };
}

function calculateFromAlleleFrequencies(p: number, q: number): HardyWeinbergResult {
  if (p < 0 || p > 1 || q < 0 || q > 1) {
    throw new Error('Allele frequencies must be between 0 and 1');
  }
  if (Math.abs(p + q - 1) > 0.0001) {
    throw new Error('p + q must equal 1');
  }
  
  const p2 = p * p;
  const pq2 = 2 * p * q;
  const q2 = q * q;
  
  // For display purposes, assume N = 1000
  const n = 1000;
  const AA = Math.round(p2 * n);
  const Aa = Math.round(pq2 * n);
  const aa = Math.round(q2 * n);
  
  return {
    p,
    q,
    p2,
    pq2,
    q2,
    n,
    AA,
    Aa,
    aa,
  };
}

function calculateChiSquare(result: HardyWeinbergResult, criticalValue: number): HardyWeinbergResult {
  const expectedAA = result.p2 * result.n;
  const expectedAa = result.pq2 * result.n;
  const expectedAaCount = result.q2 * result.n;
  
  const chiSquare = 
    Math.pow(result.AA - expectedAA, 2) / expectedAA +
    Math.pow(result.Aa - expectedAa, 2) / expectedAa +
    Math.pow(result.aa - expectedAaCount, 2) / expectedAaCount;
  
  const chiSquareResult = chiSquare <= criticalValue ? 'equilibrium' : 'notEquilibrium';
  
  return {
    ...result,
    chiSquare,
    chiSquareResult,
  };
}

function generateSteps(result: HardyWeinbergResult, method: InputMethod, t: any): string[] {
  const steps: string[] = [];
  
  if (method === 'genotype') {
    steps.push(`${t('step1')}: N = AA + Aa + aa = ${result.AA} + ${result.Aa} + ${result.aa} = ${result.n}`);
    steps.push(`${t('step2')}: q = √(aa/N) = √(${result.aa}/${result.n}) = ${result.q.toFixed(4)}`);
    steps.push(`${t('step3')}: p = 1 - q = 1 - ${result.q.toFixed(4)} = ${result.p.toFixed(4)}`);
  } else if (method === 'phenotype') {
    steps.push(`${t('step1')}: N = ${result.n}`);
    steps.push(`${t('step2')}: q = √(aa/N) = √(${result.aa}/${result.n}) = ${result.q.toFixed(4)}`);
    steps.push(`${t('step3')}: p = 1 - q = 1 - ${result.q.toFixed(4)} = ${result.p.toFixed(4)}`);
  } else {
    steps.push(`${t('step1')}: p = ${result.p.toFixed(4)}, q = ${result.q.toFixed(4)}`);
    steps.push(`${t('step2')}: p + q = ${result.p.toFixed(4)} + ${result.q.toFixed(4)} = 1.0000`);
  }
  
  steps.push(`${t('step4')}: p² = (${result.p.toFixed(4)})² = ${result.p2.toFixed(4)}`);
  steps.push(`${t('step5')}: 2pq = 2 × ${result.p.toFixed(4)} × ${result.q.toFixed(4)} = ${result.pq2.toFixed(4)}`);
  steps.push(`${t('step6')}: q² = (${result.q.toFixed(4)})² = ${result.q2.toFixed(4)}`);
  
  return steps;
}

export function HardyWeinbergCalculator() {
  const t = useTranslations('calculators.hardyWeinberg');

  const [inputMethod, setInputMethod] = useState<InputMethod>('genotype');
  
  // Genotype counts inputs
  const [AA, setAA] = useState<string>('');
  const [Aa, setAa] = useState<string>('');
  const [aa, setAaCount] = useState<string>('');
  
  // Phenotype inputs
  const [totalN, setTotalN] = useState<string>('');
  const [recessiveCount, setRecessiveCount] = useState<string>('');
  
  // Allele frequency inputs
  const [p, setP] = useState<string>('');
  const [q, setQ] = useState<string>('');
  
  // Advanced options
  const [showChiSquare, setShowChiSquare] = useState<boolean>(false);
  const [criticalValue, setCriticalValue] = useState<string>('3.84');
  const [showSteps, setShowSteps] = useState<boolean>(false);
  
  const [result, setResult] = useState<HardyWeinbergResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    try {
      let calculatedResult: HardyWeinbergResult;
      
      if (inputMethod === 'genotype') {
        const parsedAA = parseFloat(AA.replace(',', '.'));
        const parsedAa = parseFloat(Aa.replace(',', '.'));
        const parsedAaCount = parseFloat(aa.replace(',', '.'));
        
        if (!Number.isFinite(parsedAA) || !Number.isFinite(parsedAa) || !Number.isFinite(parsedAaCount) ||
            parsedAA < 0 || parsedAa < 0 || parsedAaCount < 0) {
          setResult(null);
          return;
        }
        
        calculatedResult = calculateFromGenotypeCounts(parsedAA, parsedAa, parsedAaCount);
      } else if (inputMethod === 'phenotype') {
        const parsedN = parseFloat(totalN.replace(',', '.'));
        const parsedRecessive = parseFloat(recessiveCount.replace(',', '.'));
        
        if (!Number.isFinite(parsedN) || !Number.isFinite(parsedRecessive) ||
            parsedN <= 0 || parsedRecessive < 0 || parsedRecessive > parsedN) {
          setResult(null);
          return;
        }
        
        calculatedResult = calculateFromPhenotype(parsedN, parsedRecessive);
      } else {
        const parsedP = parseFloat(p.replace(',', '.'));
        let parsedQ = parseFloat(q.replace(',', '.'));
        
        // Auto-calculate q if p is provided and q is empty
        if (Number.isFinite(parsedP) && parsedP >= 0 && parsedP <= 1 && (q.trim() === '' || !Number.isFinite(parsedQ))) {
          parsedQ = 1 - parsedP;
          setQ(parsedQ.toFixed(4));
        }
        
        if (!Number.isFinite(parsedP) || !Number.isFinite(parsedQ) ||
            parsedP < 0 || parsedP > 1 || parsedQ < 0 || parsedQ > 1) {
          setResult(null);
          return;
        }
        
        calculatedResult = calculateFromAlleleFrequencies(parsedP, parsedQ);
      }
      
      // Add chi-square if enabled
      if (showChiSquare) {
        const parsedCritical = parseFloat(criticalValue.replace(',', '.'));
        if (Number.isFinite(parsedCritical) && parsedCritical > 0) {
          calculatedResult = calculateChiSquare(calculatedResult, parsedCritical);
        }
      }
      
      // Add steps if enabled
      if (showSteps) {
        calculatedResult.steps = generateSteps(calculatedResult, inputMethod, t);
      }
      
      setResult(calculatedResult);
    } catch (error) {
      setResult(null);
    }
  };

  const handleReset = () => {
    setAA('');
    setAa('');
    setAaCount('');
    setTotalN('');
    setRecessiveCount('');
    setP('');
    setQ('');
    setShowChiSquare(false);
    setCriticalValue('3.84');
    setShowSteps(false);
    setResult(null);
  };

  const hasEnoughInputs = () => {
    if (inputMethod === 'genotype') {
      return AA.trim() !== '' && Aa.trim() !== '' && aa.trim() !== '';
    } else if (inputMethod === 'phenotype') {
      return totalN.trim() !== '' && recessiveCount.trim() !== '';
    } else {
      return p.trim() !== '';
    }
  };

  // Auto-update q when p changes in allele frequency mode
  const handlePChange = (value: string) => {
    setP(value);
    const parsedP = parseFloat(value.replace(',', '.'));
    if (Number.isFinite(parsedP) && parsedP >= 0 && parsedP <= 1 && q.trim() === '') {
      setQ((1 - parsedP).toFixed(4));
    }
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Input Method Toggle */}
            <div className="input-card">
              <label className="input-label">{t('inputMethod')}</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setInputMethod('genotype')}
                  className={`btn ${inputMethod === 'genotype' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, minWidth: '100px', padding: '0.5rem', fontSize: '0.875rem' }}
                >
                  {t('methodGenotype')}
                </button>
                <button
                  onClick={() => setInputMethod('phenotype')}
                  className={`btn ${inputMethod === 'phenotype' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, minWidth: '100px', padding: '0.5rem', fontSize: '0.875rem' }}
                >
                  {t('methodPhenotype')}
                </button>
                <button
                  onClick={() => setInputMethod('allele')}
                  className={`btn ${inputMethod === 'allele' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, minWidth: '100px', padding: '0.5rem', fontSize: '0.875rem' }}
                >
                  {t('methodAllele')}
                </button>
              </div>
            </div>

            {/* Genotype Counts Inputs */}
            {inputMethod === 'genotype' && (
              <>
                <div className="input-card">
                  <label htmlFor="AA" className="input-label">
                    {t('aaCount')} (AA)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="AA"
                      type="number"
                      step="1"
                      min="0"
                      value={AA}
                      onChange={(e) => setAA(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="input-card">
                  <label htmlFor="Aa" className="input-label">
                    {t('aaHeterozygous')} (Aa)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="Aa"
                      type="number"
                      step="1"
                      min="0"
                      value={Aa}
                      onChange={(e) => setAa(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="200"
                    />
                  </div>
                </div>

                <div className="input-card">
                  <label htmlFor="aa" className="input-label">
                    {t('aaRecessive')} (aa)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="aa"
                      type="number"
                      step="1"
                      min="0"
                      value={aa}
                      onChange={(e) => setAaCount(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="100"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Phenotype Inputs */}
            {inputMethod === 'phenotype' && (
              <>
                <div className="input-card">
                  <label htmlFor="totalN" className="input-label">
                    {t('totalPopulation')} (N)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="totalN"
                      type="number"
                      step="1"
                      min="1"
                      value={totalN}
                      onChange={(e) => setTotalN(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="400"
                    />
                  </div>
                </div>

                <div className="input-card">
                  <label htmlFor="recessiveCount" className="input-label">
                    {t('recessiveIndividuals')} (aa)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="recessiveCount"
                      type="number"
                      step="1"
                      min="0"
                      value={recessiveCount}
                      onChange={(e) => setRecessiveCount(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="100"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Allele Frequency Inputs */}
            {inputMethod === 'allele' && (
              <>
                <div className="input-card">
                  <label htmlFor="p" className="input-label">
                    {t('frequencyP')} (p)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="p"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="1"
                      value={p}
                      onChange={(e) => handlePChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="0.5"
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {t('pAutoCalculate')}
                  </p>
                </div>

                <div className="input-card">
                  <label htmlFor="q" className="input-label">
                    {t('frequencyQ')} (q)
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="q"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="1"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="0.5"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Advanced Options */}
            <div className="input-card">
              <label className="input-label" style={{ fontSize: '0.9rem' }}>{t('advancedOptions')}</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showChiSquare}
                    onChange={(e) => setShowChiSquare(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{t('performChiSquare')}</span>
                </label>
                
                {showChiSquare && (
                  <div className="input-with-unit">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={criticalValue}
                      onChange={(e) => setCriticalValue(e.target.value)}
                      className="number-input"
                      placeholder="3.84"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <span className="unit-select" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem' }}>
                      {t('criticalValue')}
                    </span>
                  </div>
                )}
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showSteps}
                    onChange={(e) => setShowSteps(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{t('showMathSteps')}</span>
                </label>
              </div>
            </div>

            <div className="action-buttons" style={{ minHeight: '44px', minWidth: '140px', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" disabled={!hasEnoughInputs()}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Result */}
        <div
          ref={resultRef}
          className="result-section"
          style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}
        >
          <div className="input-card">
            <label className="input-label">{t('result')}</label>
            {result === null && (
              <div
                className="number-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '52px',
                  padding: '0.75rem 1rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  {hasEnoughInputs() ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}
            {result !== null && (
              <>
                <div className="result-display">
                  {/* Hardy-Weinberg Variables Table */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t('hwVariables')}</h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div className="result-item">
                        <div className="result-label">p (Dominant allele)</div>
                        <div className="number-input result-value-box">
                          <span className="result-value">{result.p.toFixed(4)}</span>
                          <CopyButton text={result.p.toFixed(4)} />
                        </div>
                      </div>
                      <div className="result-item">
                        <div className="result-label">q (Recessive allele)</div>
                        <div className="number-input result-value-box">
                          <span className="result-value">{result.q.toFixed(4)}</span>
                          <CopyButton text={result.q.toFixed(4)} />
                        </div>
                      </div>
                      <div className="result-item">
                        <div className="result-label">p² (Homozygous dominant)</div>
                        <div className="number-input result-value-box">
                          <span className="result-value">{result.p2.toFixed(4)}</span>
                          <CopyButton text={result.p2.toFixed(4)} />
                        </div>
                      </div>
                      <div className="result-item">
                        <div className="result-label">2pq (Heterozygous/Carrier)</div>
                        <div className="number-input result-value-box">
                          <span className="result-value">{result.pq2.toFixed(4)}</span>
                          <CopyButton text={result.pq2.toFixed(4)} />
                        </div>
                      </div>
                      <div className="result-item">
                        <div className="result-label">q² (Homozygous recessive)</div>
                        <div className="number-input result-value-box">
                          <span className="result-value">{result.q2.toFixed(4)}</span>
                          <CopyButton text={result.q2.toFixed(4)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Genotype Counts */}
                  {inputMethod !== 'allele' && (
                    <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t('genotypeCounts')}</h3>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <div className="result-item">
                          <div className="result-label">AA (Homozygous dominant)</div>
                          <div className="number-input result-value-box">
                            <span className="result-value">{result.AA}</span>
                            <CopyButton text={result.AA.toString()} />
                          </div>
                        </div>
                        <div className="result-item">
                          <div className="result-label">Aa (Heterozygous)</div>
                          <div className="number-input result-value-box">
                            <span className="result-value">{result.Aa}</span>
                            <CopyButton text={result.Aa.toString()} />
                          </div>
                        </div>
                        <div className="result-item">
                          <div className="result-label">aa (Homozygous recessive)</div>
                          <div className="number-input result-value-box">
                            <span className="result-value">{result.aa}</span>
                            <CopyButton text={result.aa.toString()} />
                          </div>
                        </div>
                        <div className="result-item">
                          <div className="result-label">N (Total population)</div>
                          <div className="number-input result-value-box">
                            <span className="result-value">{result.n}</span>
                            <CopyButton text={result.n.toString()} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chi-Square Result */}
                  {result.chiSquare !== undefined && (
                    <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t('chiSquareTest')}</h3>
                      <div className="result-item">
                        <div className="result-label">{t('chiSquareValue')}</div>
                        <div className="number-input result-value-box">
                          <span className="result-value">{result.chiSquare.toFixed(4)}</span>
                          <CopyButton text={result.chiSquare.toFixed(4)} />
                        </div>
                      </div>
                      <div className="result-item" style={{ marginTop: '0.75rem' }}>
                        <div className="result-label">{t('criticalValue')}</div>
                        <div className="number-input result-value-box">
                          <span className="result-value">{criticalValue}</span>
                        </div>
                      </div>
                      <div
                        className="number-input result-value-box"
                        style={{
                          marginTop: '0.75rem',
                          backgroundColor: result.chiSquareResult === 'equilibrium' 
                            ? 'rgba(34, 197, 94, 0.1)' 
                            : 'rgba(239, 68, 68, 0.1)',
                          border: `2px solid ${result.chiSquareResult === 'equilibrium' 
                            ? 'rgba(34, 197, 94, 0.3)' 
                            : 'rgba(239, 68, 68, 0.3)'}`,
                        }}
                      >
                        <span
                          className="result-value"
                          style={{
                            color: result.chiSquareResult === 'equilibrium' 
                              ? 'rgb(34, 197, 94)' 
                              : 'rgb(239, 68, 68)',
                            fontWeight: 'bold',
                          }}
                        >
                          {result.chiSquareResult === 'equilibrium' 
                            ? t('inEquilibrium') 
                            : t('notInEquilibrium')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Math */}
                  {result.steps && result.steps.length > 0 && (
                    <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                      <h3 className="example-heading">{t('calculationSteps')}</h3>
                      <div className="example-text" style={{ lineHeight: '1.8' }}>
                        {result.steps.map((step, index) => (
                          <p key={index} style={{ marginBottom: '0.5rem' }}>
                            {step}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
