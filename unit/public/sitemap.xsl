<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - CalculinoHub.com</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #ffffff;
            padding: 2rem;
            color: #333;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
          }
          
          .header {
            background: #ffffff;
            color: #333;
            padding: 2rem 0;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 2rem;
          }
          
          .header h1 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .header p {
            font-size: 1rem;
            color: #666;
          }
          
          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1rem;
            flex-wrap: wrap;
          }
          
          .stat {
            padding: 0.5rem 1rem;
          }
          
          .stat-number {
            font-size: 1.5rem;
            font-weight: 600;
            display: block;
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: #666;
          }
          
          .content {
            padding: 0;
          }
          
          .url-list {
            list-style: none;
          }
          
          .url-item {
            background: #ffffff;
            border: 1px solid #e0e0e0;
            padding: 1rem;
            margin-bottom: 0.5rem;
          }
          
          .url-link {
            font-size: 1rem;
            font-weight: 500;
            color: #0066cc;
            text-decoration: none;
            display: block;
            margin-bottom: 0.5rem;
            word-break: break-all;
          }
          
          .url-link:hover {
            text-decoration: underline;
          }
          
          .url-meta {
            display: flex;
            gap: 1.5rem;
            flex-wrap: wrap;
            font-size: 0.875rem;
            color: #666;
          }

          .alternates {
            margin-top: 0.75rem;
            font-size: 0.875rem;
            color: #666;
          }

          .alternate-list {
            margin-top: 0.5rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .alternate-chip {
            display: inline-flex;
            align-items: center;
            padding: 0.2rem 0.5rem;
            border: 1px solid #e0e0e0;
            border-radius: 999px;
            background: #fafafa;
            max-width: 100%;
          }

          .alternate-chip a {
            color: #0066cc;
            text-decoration: none;
            font-weight: 500;
          }

          .alternate-chip a:hover {
            text-decoration: underline;
          }
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .meta-label {
            font-weight: 500;
            color: #333;
          }
          
          .priority {
            display: inline-block;
            padding: 0.125rem 0.5rem;
            background: #f0f0f0;
            color: #333;
            border-radius: 0.25rem;
            font-weight: 500;
            font-size: 0.875rem;
          }
          
          .footer {
            text-align: center;
            padding: 2rem 0;
            border-top: 1px solid #e0e0e0;
            margin-top: 2rem;
            color: #666;
            font-size: 0.875rem;
          }
          
          .footer a {
            color: #0066cc;
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
              padding: 1.5rem 0;
            }
            
            .header h1 {
              font-size: 1.5rem;
            }
            
            .stats {
              gap: 1rem;
            }
            
            .content {
              padding: 0;
            }
            
            .url-item {
              padding: 0.75rem;
            }
            
            .url-meta {
              flex-direction: column;
              gap: 0.25rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XML Sitemap</h1>
            <p>CalculinoHub.com - Complete site structure</p>
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

                  <xsl:if test="xhtml:link">
                    <div class="alternates">
                      <span class="meta-label">Alternates (hreflang):</span>
                      <div class="alternate-list">
                        <xsl:for-each select="xhtml:link">
                          <span class="alternate-chip">
                            <a href="{@href}">
                              <xsl:value-of select="@hreflang"/>
                            </a>
                          </span>
                        </xsl:for-each>
                      </div>
                    </div>
                  </xsl:if>
                </li>
              </xsl:for-each>
            </ul>
          </div>
          
          <div class="footer">
            <p>
              Generated by <a href="https://calculinohub.com">CalculinoHub.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
