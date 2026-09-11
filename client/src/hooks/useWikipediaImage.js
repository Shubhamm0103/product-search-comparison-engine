import { useEffect, useState } from 'react';

// Real Wikipedia articles for an actual, real laptop line per brand —
// this is genuine product photography of real machines, not stock photos.
const BRAND_WIKI_PAGES = {
  'Dell': 'Dell_XPS',
  'HP': 'HP_Spectre',
  'Lenovo': 'ThinkPad',
  'Asus': 'Asus_ZenBook',
  'Acer': 'Acer_Aspire',
  'Apple': 'MacBook_Pro',
  'MSI': 'Gaming_laptop',
  'Samsung': 'Samsung_Galaxy_Book',
};

// Module-level cache: one fetch per brand ever, shared across every card
const cache = {};
const listeners = {};

async function fetchImageForBrand(brand) {
  const page = BRAND_WIKI_PAGES[brand];
  if (!page) return null;

  if (cache[brand] !== undefined) return cache[brand];

  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${page}`);
    if (!res.ok) throw new Error('Wikipedia fetch failed');
    const data = await res.json();
    const url = data.thumbnail?.source || data.originalimage?.source || null;
    cache[brand] = url;
    return url;
  } catch {
    cache[brand] = null;
    return null;
  }
}

function useWikipediaImage(brand) {
  const [url, setUrl] = useState(cache[brand] ?? undefined);

  useEffect(() => {
    let isCancelled = false;

    if (cache[brand] !== undefined) {
      setUrl(cache[brand]);
      return;
    }

    fetchImageForBrand(brand).then(result => {
      if (!isCancelled) setUrl(result);
    });

    return () => { isCancelled = true; };
  }, [brand]);

  return url; // undefined = still loading, null = failed/no image, string = real image URL
}

export default useWikipediaImage;
