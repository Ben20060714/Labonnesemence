/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}

const setMetaTag = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
};

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: SEOProps) {
  useEffect(() => {
    const siteName = 'Église La Bonne Semence';
    const defaultDescription = "Communauté des Assemblées Bonne Semence (CABCS). Fondée par le Patriarche Jean Médard Kalonda, dirigée par le Pasteur Djoe Baruani. Une église, un seul corps : le Christ.";
    const defaultKeywords = 'église, la bonne semence, CABCS, foi chrétienne, salut, Jésus-Christ, Kinshasa, Pasteur Djoe Baruani, évangélisation, communauté chrétienne';
    const siteUrl = 'https://lbs.cabcs.org';
    const defaultImage = '/img/church-preview.jpg';

    const seoTitle = title ? `${title} | ${siteName}` : `${siteName} - Une église, Un seul corps`;
    const seoDescription = description || defaultDescription;
    const seoKeywords = keywords || defaultKeywords;
    const seoUrl = url ? `${siteUrl}${url}` : siteUrl;
    const seoImage = image ? `${siteUrl}${image}` : `${siteUrl}${defaultImage}`;

    document.title = seoTitle;
    setMetaTag('meta[name="description"]', 'name', 'description', seoDescription);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', seoKeywords);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', seoTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', seoDescription);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', seoImage);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', seoUrl);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seoTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seoDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', seoImage);
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
    setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', 'index, follow');
  }, [description, image, keywords, title, type, url]);

  return null;
}
