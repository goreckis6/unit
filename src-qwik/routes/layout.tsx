import { component$, Slot, useStyles$ } from '@builder.io/qwik';

export default component$(() => {
  useStyles$(`
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f9fa; color: #333; }
    .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.5rem; font-weight: 800; text-decoration: none; color: white; display: flex; align-items: center; gap: 0.5rem; }
    .logo-icon { font-size: 2rem; }
    .nav-links { display: flex; gap: 2rem; }
    .nav-link { color: white; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
    .nav-link:hover { opacity: 0.8; }
    .main-content { min-height: calc(100vh - 200px); }
    .footer { background: #2d3748; color: white; padding: 2rem 1rem; text-align: center; margin-top: 4rem; }
    .footer-content { max-width: 1200px; margin: 0 auto; }
    .footer-tagline { margin-top: 0.5rem; opacity: 0.8; font-size: 0.9rem; }
    @media (max-width: 768px) {
      .navbar { padding: 1rem; }
      .nav-container { flex-direction: column; gap: 1rem; }
      .nav-links { gap: 1rem; }
      .logo { font-size: 1.25rem; }
    }
  `);

  return (
    <>
      <nav class="navbar">
        <div class="nav-container">
          <a href="/" class="logo">
            <span class="logo-icon">🔢</span>
            Unit Converter Hub
          </a>
          <div class="nav-links">
            <a href="/" class="nav-link">Home</a>
            <a href="/calculators/math-calculators" class="nav-link">Math</a>
            <a href="/calculators/electrical-calculator" class="nav-link">Electrical</a>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <Slot />
      </main>

      <footer class="footer">
        <div class="footer-content">
          <p>&copy; {new Date().getFullYear()} Unit Converter Hub. All rights reserved.</p>
          <p class="footer-tagline">Fast, Free, and Accurate Calculations</p>
        </div>
      </footer>
    </>
  );
});
