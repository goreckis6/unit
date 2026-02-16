'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  heading: string;
  items: FaqItem[];
}

export function FaqSection({ heading, items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-section">
      <div className="container">
        <div className="faq-content-card">
          <h2 className="faq-heading">{heading}</h2>
          
          <div className="faq-list">
            {items.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? 'faq-item-open' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleItem(index)}
                  aria-expanded={openIndex === index}
                >
                  <span className="faq-question-text">{item.question}</span>
                  <svg
                    className="faq-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="faq-answer-wrapper">
                  <div className="faq-answer">{item.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
