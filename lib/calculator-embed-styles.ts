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
@media (min-width: 768px) {
  .split-view-container { grid-template-columns: 1fr 1fr; padding: 2rem; }
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
.number-input::placeholder { color: var(--text-tertiary); opacity: 0.5; }
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
.result-value-box { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
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
.result-value-inline { color: var(--primary-color); font-size: 1.25rem; font-weight: 700; }
.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 480px) { .options-grid { grid-template-columns: 1fr; } }
`;
