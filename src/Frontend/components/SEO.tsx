/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  /** Titre de la page - sera suffixé par le nom du site */
  title?: string;
  /** Description meta pour les moteurs de recherche */
  description?: string;
  /** Mots-clés séparés par des virgules */
  keywords?: string;
  /** Chemin de l'image pour le partage social (OG Image) */
  image?: string;
  /** URL canonique de la page */
  url?: string;
  /** Type OpenGraph (website, article, etc.) */
  type?: 'website' | 'article' | 'profile';
}

/**
 * Composant SEO pour l'église "La Bonne Semence" (CABCS).
 * Gère les balises meta du head pour optimiser le référencement naturel et le partage social.
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}) => {
  const siteName = "Église La Bonne Semence";
  const defaultDescription = "Communauté des Assemblées Bonne Semence (CABCS). Fondée par le Patriarche Jean Médard Kalonda, dirigée par le Pasteur Djoe Baruani. Une église, un seul corps : le Christ.";
  const defaultKeywords = "église, la bonne semence, CABCS, foi chrétienne, salut, Jésus-Christ, Kinshasa, Pasteur Djoe Baruani, évangélisation, communauté chrétienne";
  const siteUrl = "https://lbs.cabcs.org"; // À remplacer par le domaine de production
  const defaultImage = "/img/church-preview.jpg";

  const seoTitle = title ? `${title} | ${siteName}` : `${siteName} - Une église, Un seul corps`;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoUrl = url ? `${siteUrl}${url}` : siteUrl;
  const seoImage = image ? `${siteUrl}${image}` : `${siteUrl}${defaultImage}`;

  return (
    <Helmet>
      {/* Balises de base */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Indexation Moteurs de Recherche */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Données structurées JSON-LD - Schéma pour un lieu de culte */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PlaceOfWorship",
          "name": siteName,
          "alternateName": "CABCS",
          "description": defaultDescription,
          "url": siteUrl,
          "image": seoImage,
          "founder": {
            "@type": "Person",
            "name": "Jean Médard Kalonda Bin Baruani"
          },
          "leader": {
            "@type": "Person",
            "name": "Pasteur Djoe Baruani"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CD",
            "addressLocality": "Kinshasa"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;