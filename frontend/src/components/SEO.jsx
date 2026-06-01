import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, url, schema }) {
  const siteTitle = 'TestPulse | Online Examination Platform';
  const fullTitle = title ? `${title} | TestPulse` : siteTitle;
  const defaultDesc = 'TestPulse — Online Examination Processing Platform. Take exams, manage question banks, and view results with a modern, secure interface.';
  const finalDesc = description || defaultDesc;
  const defaultKeywords = 'online exam platform, online examination system, create online exam, MERN exam platform';
  const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const siteUrl = 'https://testpulse.vercel.app';
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={finalDesc} />
      <meta property="twitter:image" content={`${siteUrl}/og-image.jpg`} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
