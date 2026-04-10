/** CSS for Sandpack calculator embed - embedded to ensure it loads reliably */

export const CALCULATOR_EMBED_CSS = `/* Calculator styles - matches main site */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root {
  --primary-color: #6366f1;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --border-color: #e2e8f0;
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
.calc-embed-root {
  padding: 2rem;
  min-height: 420px;
  background: var(--bg-secondary);
}
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-primary);
  background: var(--bg-secondary);
  line-height: 1.6;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}
.split-view-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
  width: 100%;
  padding: 1.5rem;
}
/* Two columns only from ~900px — portrait tablets stay single column (less cramped) */
@media (min-width: 900px) {
  .split-view-container { grid-template-columns: 1fr 1fr; padding: 2rem; }
}
@media (min-width: 768px) and (max-width: 899px) {
  .split-view-container { grid-template-columns: 1fr; padding: 1.5rem; gap: 1.5rem; }
}
.input-section { margin-bottom: 2rem; width: 100%; }
.input-card { display: flex; flex-direction: column; width: 100%; min-width: 0; }
.input-label {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
  margin-bottom: 1rem;
  letter-spacing: -0.3px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.form-group:last-of-type { margin-bottom: 0; }
.input-legend {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
  border-left: 3px solid var(--primary-color);
}
.legend-text { margin: 0; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; }
.number-input {
  flex: 1;
  min-width: 0;
  padding: 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 100%;
  font-family: inherit;
}
.number-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}
.number-input::placeholder { color: var(--text-tertiary); opacity: 0.35; }
.action-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }
.btn {
  padding: 1rem 2rem;
  border-radius: 0.875rem;
  font-size: 1.0625rem;
  font-weight: 700;
  transition: all 0.25s ease;
  border: none;
  cursor: pointer;
  font-family: inherit;
  min-height: 48px;
  touch-action: manipulation;
}
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
}
.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}
.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}
.result-section { margin-top: 0; padding-top: 0; border-top: none; }
.result-item { margin-bottom: 1rem; }
.result-label { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.35rem; }
.result-value-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
}
.number-input.result-value-box { padding: 0.75rem 1rem; }
select.number-input { cursor: pointer; min-width: 80px; }
.result-value { font-weight: 700; font-size: 1.25rem; color: var(--primary-color); }
.copy-result-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  color: var(--text-primary);
}
.copy-result-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
.result-placeholder { color: var(--text-tertiary); font-size: 1rem; font-weight: 500; }
.validation-message {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.validation-message.warning {
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #b45309;
}
.validation-message.info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #1d4ed8;
}
.result-value-inline { color: var(--primary-color); font-size: 1.25rem; font-weight: 700; }
.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 640px) { .options-grid { grid-template-columns: 1fr; gap: 0.75rem; } }
@media (max-width: 1024px) {
  .calc-embed-root { padding: 1.5rem; min-height: 380px; }
}
@media (max-width: 640px) {
  .calc-embed-root { padding: 1rem 0.75rem; min-height: 320px; }
  .split-view-container { padding: 1rem; gap: 1.25rem; }
  .input-label { font-size: 1rem; margin-bottom: 0.75rem; }
  .number-input, select.number-input {
    font-size: 16px;
    padding: 0.875rem 1rem;
  }
  .form-group { gap: 0.5rem; }
  .action-buttons { flex-direction: column; gap: 0.625rem; }
  .action-buttons .btn { width: 100%; justify-content: center; }
  .copy-result-btn { min-height: 44px; min-width: 44px; padding: 0.625rem 1rem; }
}
`;
