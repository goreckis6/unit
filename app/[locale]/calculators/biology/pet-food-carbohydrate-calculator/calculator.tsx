'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type FoodType = 'dry' | 'wet' | 'raw' | 'freezeDried';

interface PetFoodResult {
  carbsAsFed: number;
  dryMatterPercent: number;
  carbsDMB: number;
  rating: 'low' | 'medium' | 'high';
  proteinDMB: number;
  fatDMB: number;
  fiberDMB: number;
  ashDMB: number;
  caloriesFromCarbs?: number;
}

function getDefaultAsh(foodType: FoodType): number {
  switch (foodType) {
    case 'dry':
      return 7.5;
    case 'wet':
      return 2.5;
    case 'raw':
      return 2.0;
    case 'freezeDried':
      return 6.0;
    default:
      return 7.5;
  }
}

function calculatePetFoodCarbs(
  protein: number,
  fat: number,
  fiber: number,
  moisture: number,
  ash: number,
  caloricDensity?: number
): PetFoodResult {
  // Step 1: Calculate As-Fed Carbohydrates
  const carbsAsFed = 100 - (protein + fat + fiber + moisture + ash);
  
  // Step 2: Calculate Dry Matter Basis
  const dryMatterPercent = 100 - moisture;
  const carbsDMB = (carbsAsFed / dryMatterPercent) * 100;
  
  // Calculate other nutrients on DMB
  const proteinDMB = (protein / dryMatterPercent) * 100;
  const fatDMB = (fat / dryMatterPercent) * 100;
  const fiberDMB = (fiber / dryMatterPercent) * 100;
  const ashDMB = (ash / dryMatterPercent) * 100;
  
  // Determine rating
  let rating: 'low' | 'medium' | 'high';
  if (carbsDMB < 20) {
    rating = 'low';
  } else if (carbsDMB <= 40) {
    rating = 'medium';
  } else {
    rating = 'high';
  }
  
  // Calculate % of calories from carbs if caloric density is provided
  let caloriesFromCarbs: number | undefined;
  if (caloricDensity && caloricDensity > 0) {
    // Modified Atwater factors: Protein = 3.5 kcal/g, Fat = 8.5 kcal/g, Carbs = 3.5 kcal/g
    const proteinKcal = (protein / 100) * 3.5;
    const fatKcal = (fat / 100) * 8.5;
    const carbsKcal = (carbsAsFed / 100) * 3.5;
    const totalKcal = proteinKcal + fatKcal + carbsKcal;
    
    if (totalKcal > 0) {
      caloriesFromCarbs = (carbsKcal / totalKcal) * 100;
    }
  }
  
  return {
    carbsAsFed,
    dryMatterPercent,
    carbsDMB,
    rating,
    proteinDMB,
    fatDMB,
    fiberDMB,
    ashDMB,
    caloriesFromCarbs,
  };
}

export function PetFoodCarbCalculator() {
  const t = useTranslations('calculators.petFoodCarb');

  const [protein, setProtein] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [fiber, setFiber] = useState<string>('');
  const [moisture, setMoisture] = useState<string>('');
  const [ash, setAsh] = useState<string>('');
  const [foodType, setFoodType] = useState<FoodType>('dry');
  const [useCustomAsh, setUseCustomAsh] = useState<boolean>(false);
  const [caloricDensity, setCaloricDensity] = useState<string>('');
  const [showCalories, setShowCalories] = useState<boolean>(false);
  
  const [result, setResult] = useState<PetFoodResult | null>(null);
  const resultRef = useScrollToResult(result);

  // Update ash default when food type changes
  useEffect(() => {
    if (!useCustomAsh) {
      setAsh(getDefaultAsh(foodType).toString());
    }
  }, [foodType, useCustomAsh]);

  const handleCalculate = () => {
    const parsedProtein = parseFloat(protein.replace(',', '.'));
    const parsedFat = parseFloat(fat.replace(',', '.'));
    const parsedFiber = parseFloat(fiber.replace(',', '.'));
    const parsedMoisture = parseFloat(moisture.replace(',', '.'));
    const parsedAsh = parseFloat(ash.replace(',', '.'));
    
    if (
      !Number.isFinite(parsedProtein) ||
      !Number.isFinite(parsedFat) ||
      !Number.isFinite(parsedFiber) ||
      !Number.isFinite(parsedMoisture) ||
      !Number.isFinite(parsedAsh) ||
      parsedProtein < 0 || parsedProtein > 100 ||
      parsedFat < 0 || parsedFat > 100 ||
      parsedFiber < 0 || parsedFiber > 100 ||
      parsedMoisture < 0 || parsedMoisture > 100 ||
      parsedAsh < 0 || parsedAsh > 100
    ) {
      setResult(null);
      return;
    }
    
    const total = parsedProtein + parsedFat + parsedFiber + parsedMoisture + parsedAsh;
    if (total > 100) {
      setResult(null);
      return;
    }
    
    let parsedCalories: number | undefined;
    if (showCalories && caloricDensity.trim() !== '') {
      parsedCalories = parseFloat(caloricDensity.replace(',', '.'));
      if (!Number.isFinite(parsedCalories) || parsedCalories <= 0) {
        parsedCalories = undefined;
      }
    }
    
    const calculatedResult = calculatePetFoodCarbs(
      parsedProtein,
      parsedFat,
      parsedFiber,
      parsedMoisture,
      parsedAsh,
      parsedCalories
    );
    
    setResult(calculatedResult);
  };

  const handleReset = () => {
    setProtein('');
    setFat('');
    setFiber('');
    setFiber('');
    setMoisture('');
    setAsh(getDefaultAsh(foodType).toString());
    setFoodType('dry');
    setUseCustomAsh(false);
    setCaloricDensity('');
    setShowCalories(false);
    setResult(null);
  };

  const hasEnoughInputs = () => {
    return (
      protein.trim() !== '' &&
      fat.trim() !== '' &&
      fiber.trim() !== '' &&
      moisture.trim() !== '' &&
      ash.trim() !== ''
    );
  };

  const getRatingColor = (rating: 'low' | 'medium' | 'high') => {
    switch (rating) {
      case 'low':
        return {
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.3)',
          text: 'rgb(34, 197, 94)',
        };
      case 'medium':
        return {
          bg: 'rgba(234, 179, 8, 0.1)',
          border: 'rgba(234, 179, 8, 0.3)',
          text: 'rgb(234, 179, 8)',
        };
      case 'high':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
          text: 'rgb(239, 68, 68)',
        };
    }
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Food Type Selection */}
            <div className="input-card">
              <label htmlFor="foodType" className="input-label">
                {t('foodType')}
              </label>
              <select
                id="foodType"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as FoodType)}
                className="number-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="dry">{t('foodTypeDry')}</option>
                <option value="wet">{t('foodTypeWet')}</option>
                <option value="raw">{t('foodTypeRaw')}</option>
                <option value="freezeDried">{t('foodTypeFreezeDried')}</option>
              </select>
            </div>

            {/* Crude Protein */}
            <div className="input-card">
              <label htmlFor="protein" className="input-label">
                {t('crudeProtein')}
              </label>
              <div className="input-with-unit">
                <input
                  id="protein"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="28"
                />
                <span className="unit-select">%</span>
              </div>
            </div>

            {/* Crude Fat */}
            <div className="input-card">
              <label htmlFor="fat" className="input-label">
                {t('crudeFat')}
              </label>
              <div className="input-with-unit">
                <input
                  id="fat"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="15"
                />
                <span className="unit-select">%</span>
              </div>
            </div>

            {/* Crude Fiber */}
            <div className="input-card">
              <label htmlFor="fiber" className="input-label">
                {t('crudeFiber')}
              </label>
              <div className="input-with-unit">
                <input
                  id="fiber"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="4"
                />
                <span className="unit-select">%</span>
              </div>
            </div>

            {/* Moisture */}
            <div className="input-card">
              <label htmlFor="moisture" className="input-label">
                {t('moisture')}
              </label>
              <div className="input-with-unit">
                <input
                  id="moisture"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="10"
                />
                <span className="unit-select">%</span>
              </div>
            </div>

            {/* Ash */}
            <div className="input-card">
              <label htmlFor="ash" className="input-label">
                {t('ash')}
              </label>
              <div className="input-with-unit">
                <input
                  id="ash"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={ash}
                  onChange={(e) => {
                    setAsh(e.target.value);
                    setUseCustomAsh(true);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="7.5"
                />
                <span className="unit-select">%</span>
              </div>
              <p style={{ 
                fontSize: 'clamp(0.7rem, 2vw, 0.75rem)', 
                color: 'var(--text-secondary)', 
                marginTop: '0.25rem',
                lineHeight: '1.4'
              }}>
                {t('ashHelper')}
              </p>
            </div>

            {/* Advanced: Caloric Density */}
            <div className="input-card">
              <label style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.5rem', 
                cursor: 'pointer',
                marginBottom: '0.75rem'
              }}>
                <input
                  type="checkbox"
                  checked={showCalories}
                  onChange={(e) => setShowCalories(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    cursor: 'pointer',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                />
                <span style={{ 
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                  fontWeight: '500'
                }}>
                  {t('enableCalories')}
                </span>
              </label>
              
              {showCalories && (
                <>
                  <label htmlFor="caloricDensity" className="input-label">
                    {t('caloricDensity')}
                  </label>
                  <div className="input-with-unit">
                    <input
                      id="caloricDensity"
                      type="number"
                      step="1"
                      min="0"
                      value={caloricDensity}
                      onChange={(e) => setCaloricDensity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                      className="number-input"
                      placeholder="3500"
                    />
                    <span className="unit-select">kcal/kg</span>
                  </div>
                </>
              )}
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
                  {/* Main Result: Carbs DMB */}
                  <div className="result-item">
                    <div className="result-label" style={{ 
                      fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                      fontWeight: '600'
                    }}>
                      {t('carbsDMB')}
                    </div>
                    <div 
                      className="number-input result-value-box"
                      style={{
                        backgroundColor: getRatingColor(result.rating).bg,
                        border: `2px solid ${getRatingColor(result.rating).border}`,
                      }}
                    >
                      <span 
                        className="result-value" 
                        style={{ 
                          fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                          fontWeight: 'bold',
                          color: getRatingColor(result.rating).text
                        }}
                      >
                        {result.carbsDMB.toFixed(1)}
                      </span>
                      <span className="result-unit" style={{ color: getRatingColor(result.rating).text }}>%</span>
                      <CopyButton text={`${result.carbsDMB.toFixed(1)}%`} />
                    </div>
                  </div>

                  {/* Rating */}
                  <div 
                    className="number-input result-value-box"
                    style={{
                      marginTop: '0.75rem',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      backgroundColor: getRatingColor(result.rating).bg,
                      border: `2px solid ${getRatingColor(result.rating).border}`,
                    }}
                  >
                    <span
                      className="result-value"
                      style={{
                        color: getRatingColor(result.rating).text,
                        fontWeight: 'bold',
                        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                        textAlign: 'center',
                        width: '100%'
                      }}
                    >
                      {result.rating === 'low' && t('ratingLow')}
                      {result.rating === 'medium' && t('ratingMedium')}
                      {result.rating === 'high' && t('ratingHigh')}
                    </span>
                  </div>

                  {/* As-Fed Carbs */}
                  <div className="result-item" style={{ marginTop: '1.5rem' }}>
                    <div className="result-label" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                      {t('carbsAsFed')}
                    </div>
                    <div className="number-input result-value-box">
                      <span className="result-value" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                        {result.carbsAsFed.toFixed(1)}
                      </span>
                      <span className="result-unit">%</span>
                      <CopyButton text={`${result.carbsAsFed.toFixed(1)}%`} />
                    </div>
                  </div>

                  {/* Dry Matter % */}
                  <div className="result-item">
                    <div className="result-label" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                      {t('dryMatter')}
                    </div>
                    <div className="number-input result-value-box">
                      <span className="result-value" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                        {result.dryMatterPercent.toFixed(1)}
                      </span>
                      <span className="result-unit">%</span>
                      <CopyButton text={`${result.dryMatterPercent.toFixed(1)}%`} />
                    </div>
                  </div>

                  {/* Calories from Carbs */}
                  {result.caloriesFromCarbs !== undefined && (
                    <div className="result-item">
                      <div className="result-label" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                        {t('caloriesFromCarbs')}
                      </div>
                      <div className="number-input result-value-box">
                        <span className="result-value" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                          {result.caloriesFromCarbs.toFixed(1)}
                        </span>
                        <span className="result-unit">%</span>
                        <CopyButton text={`${result.caloriesFromCarbs.toFixed(1)}%`} />
                      </div>
                    </div>
                  )}

                  {/* All Nutrients on DMB */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <h3 style={{ 
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)', 
                      fontWeight: '600', 
                      marginBottom: '1rem' 
                    }}>
                      {t('allNutrientsDMB')}
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div className="result-item">
                        <div className="result-label" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                          {t('proteinDMB')}
                        </div>
                        <div className="number-input result-value-box">
                          <span className="result-value" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                            {result.proteinDMB.toFixed(1)}
                          </span>
                          <span className="result-unit">%</span>
                        </div>
                      </div>
                      <div className="result-item">
                        <div className="result-label" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                          {t('fatDMB')}
                        </div>
                        <div className="number-input result-value-box">
                          <span className="result-value" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                            {result.fatDMB.toFixed(1)}
                          </span>
                          <span className="result-unit">%</span>
                        </div>
                      </div>
                      <div className="result-item">
                        <div className="result-label" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                          {t('fiberDMB')}
                        </div>
                        <div className="number-input result-value-box">
                          <span className="result-value" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                            {result.fiberDMB.toFixed(1)}
                          </span>
                          <span className="result-unit">%</span>
                        </div>
                      </div>
                      <div className="result-item">
                        <div className="result-label" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                          {t('ashDMB')}
                        </div>
                        <div className="number-input result-value-box">
                          <span className="result-value" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                            {result.ashDMB.toFixed(1)}
                          </span>
                          <span className="result-unit">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expert Insight */}
                  <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                    <h3 className="example-heading" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                      {t('expertInsightHeading')}
                    </h3>
                    <div className="example-text" style={{ 
                      lineHeight: '1.8',
                      fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                    }}>
                      <p style={{ marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                        {t('expertInsightText')}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
