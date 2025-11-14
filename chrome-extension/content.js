// Content script for real-time SEO analysis on page

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzePage') {
    const pageData = extractPageData();
    sendResponse({ success: true, data: pageData });
  }
  return true;
});

function extractPageData() {
  const data = {
    url: window.location.href,
    title: document.title,
    meta: {
      description: getMetaContent('description'),
      keywords: getMetaContent('keywords'),
      viewport: getMetaContent('viewport'),
      og: {
        title: getMetaProperty('og:title'),
        description: getMetaProperty('og:description'),
        image: getMetaProperty('og:image'),
        url: getMetaProperty('og:url')
      }
    },
    headings: {
      h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
      h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
      h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim())
    },
    images: Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt || '',
      title: img.title || ''
    })),
    links: {
      internal: [],
      external: []
    },
    content: {
      text: document.body.innerText.replace(/\s+/g, ' ').trim(),
      wordCount: document.body.innerText.split(/\s+/).filter(w => w.length > 0).length
    }
  };

  // Process links
  Array.from(document.querySelectorAll('a[href]')).forEach(link => {
    const href = link.href;
    const linkData = {
      url: href,
      text: link.textContent.trim(),
      anchor: link.getAttribute('href')
    };
    
    try {
      const linkUrl = new URL(href);
      const pageUrl = new URL(window.location.href);
      
      if (linkUrl.origin === pageUrl.origin) {
        data.links.internal.push(linkData);
      } else {
        data.links.external.push(linkData);
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });

  data.links.total = data.links.internal.length + data.links.external.length;

  return data;
}

function getMetaContent(name) {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta ? meta.getAttribute('content') : '';
}

function getMetaProperty(property) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  return meta ? meta.getAttribute('content') : '';
}

