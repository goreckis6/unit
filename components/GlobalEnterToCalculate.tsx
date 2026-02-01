'use client';

import { useEffect } from 'react';

 export function GlobalEnterToCalculate() {
   useEffect(() => {
     const handleKeyDown = (event: KeyboardEvent) => {
       if (
         event.key !== 'Enter' ||
         event.defaultPrevented ||
         event.isComposing ||
         event.shiftKey ||
         event.altKey ||
         event.ctrlKey ||
         event.metaKey
       ) {
         return;
       }

       const target = event.target as HTMLElement | null;
       if (!target) return;

       const tagName = target.tagName.toLowerCase();
       if (tagName === 'textarea' || target.isContentEditable) {
         return;
       }

       if (tagName !== 'input' && tagName !== 'select') {
         return;
       }

       const calculatorCard = target.closest('.calculator-card');
       if (!calculatorCard) return;

       const primaryButton = calculatorCard.querySelector<HTMLButtonElement>(
         'button.btn.btn-primary'
       );

       if (!primaryButton || primaryButton.disabled) return;

       event.preventDefault();
       primaryButton.click();
     };

     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, []);

   return null;
 }
