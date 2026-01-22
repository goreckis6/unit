<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - UnitConverterHub.com</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            background-attachment: fixed;
            padding: 2rem;
            color: #0f172a;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 2rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.12);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
          }
          
          .header p {
            font-size: 1.125rem;
            opacity: 0.9;
          }
          
          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 2rem;
            flex-wrap: wrap;
          }
          
          .stat {
            background: rgba(255, 255, 255, 0.2);
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            backdrop-filter: blur(10px);
          }
          
          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            display: block;
          }
          
          .stat-label {
            font-size: 0.875rem;
            opacity: 0.9;
          }
          
          .content {
            padding: 2rem;
          }
          
          .url-list {
            list-style: none;
          }
          
          .url-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
          }
          
          .url-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
            border-color: #6366f1;
          }
          
          .url-link {
            font-size: 1.125rem;
            font-weight: 600;
            color: #6366f1;
            text-decoration: none;
            display: block;
            margin-bottom: 0.75rem;
            word-break: break-all;
          }
          
          .url-link:hover {
            color: #4f46e5;
            text-decoration: underline;
          }
          
          .url-meta {
            display: flex;
            gap: 1.5rem;
            flex-wrap: wrap;
            font-size: 0.875rem;
            color: #64748b;
          }
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .meta-label {
            font-weight: 600;
            color: #475569;
          }
          
          .priority {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #e0e7ff;
            color: #4f46e5;
            border-radius: 0.5rem;
            font-weight: 600;
            font-size: 0.875rem;
          }
          
          .footer {
            text-align: center;
            padding: 2rem;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 0.875rem;
          }
          
          .footer a {
            color: #6366f1;
            text-decoration: none;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 768px) {
            body {
              padding: 1rem;
            }
            
            .header {
              padding: 2rem 1.5rem;
            }
            
            .header h1 {
              font-size: 2rem;
            }
            
            .stats {
              gap: 1rem;
            }
            
            .stat {
              padding: 0.75rem 1.5rem;
            }
            
            .content {
              padding: 1.5rem;
            }
            
            .url-item {
              padding: 1rem;
            }
            
            .url-meta {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XML Sitemap</h1>
            <p>UnitConverterHub.com - Complete site structure</p>
            <div class="stats">
              <div class="stat">
                <span class="stat-number"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span>
                <span class="stat-label">Total URLs</span>
              </div>
            </div>
          </div>
          
          <div class="content">
            <ul class="url-list">
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <li class="url-item">
                  <a class="url-link" href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                  <div class="url-meta">
                    <div class="meta-item">
                      <span class="meta-label">Priority:</span>
                      <span class="priority"><xsl:value-of select="sitemap:priority"/></span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Change Frequency:</span>
                      <span><xsl:value-of select="sitemap:changefreq"/></span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Last Modified:</span>
                      <span><xsl:value-of select="sitemap:lastmod"/></span>
                    </div>
                  </div>
                </li>
              </xsl:for-each>
            </ul>
          </div>
          
          <div class="footer">
            <p>
              Generated by <a href="https://unitconverterhub.com">UnitConverterHub.com</a> |
              <a href="/sitemap">View Visual Sitemap</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
