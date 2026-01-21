import { component$, Slot } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <>
      <nav class="navbar">
        <div class="nav-container">
          <Link href="/" class="logo">
            <span class="logo-icon">🔢</span>
            Unit Converter Hub
          </Link>
          <div class="nav-links">
            <Link href="/calculators/math-calculators" class="nav-link">
              Calculators
            </Link>
            <Link href="/" class="nav-link">
              Home
            </Link>
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

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f8f9fa;
        }

        .navbar {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-icon {
          font-size: 1.8rem;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          text-decoration: none;
          color: #555;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #667eea;
        }

        .main-content {
          min-height: calc(100vh - 200px);
        }

        .footer {
          background: #2d3748;
          color: white;
          padding: 2rem 1rem;
          margin-top: 4rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-tagline {
          margin-top: 0.5rem;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 1rem;
          }

          .logo {
            font-size: 1.2rem;
          }

          .nav-links {
            gap: 1rem;
          }

          .nav-link {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
});
