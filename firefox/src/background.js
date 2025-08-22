import { getArxivTags, formatFilename } from './utils.js';

const processedDownloads = new Set();
const newFilenames = new Map();

// The main listener for new downloads.
browser.downloads.onCreated.addListener((downloadItem) => {
  if (processedDownloads.has(downloadItem.url)) {
    return;
  }

  const urlMatch = downloadItem.url.match(/arxiv\.org\/pdf\/(\d+\.\d+)(?:v\d+)?(?:\.pdf)?$/);

  if (urlMatch) {
    const arxivId = urlMatch[1];
    const absUrl = `https://arxiv.org/abs/${arxivId}`;
    
    // Cancel the current download -> fetch metadata -> start new download with custom filename.

    processedDownloads.add(downloadItem.url);
    browser.downloads.cancel(downloadItem.id);
    
    (async () => {
      try {
        const metaTags = await getArxivTags(absUrl);
        const storageItems = await browser.storage.sync.get({ filenameTemplate: '%A-%t (%Y).pdf' });
        const newFilename = formatFilename(storageItems.filenameTemplate, metaTags);

        newFilenames.set(downloadItem.url, newFilename);

        browser.downloads.download({
          url: downloadItem.url,
          filename: newFilename,
          saveAs: false
        });
      } catch (e) {
        console.error("Error while processing download:", e);

      }
    })();
  }
});

// Upon download completion, clean up the processed url and notify the user.
browser.downloads.onChanged.addListener((delta) => {
  if (delta.state && delta.state.current === 'complete') {
    (async () => {
      const downloadUrls = await browser.downloads.search({ id: delta.id });
      if (downloadUrls.length > 0) {
        const downloadItem = downloadUrls[0];
        const { url } = downloadItem;
        
        if (processedDownloads.has(url)) {
          processedDownloads.delete(url);
        }

        if (newFilenames.has(url)) {
          const filename = newFilenames.get(url);
          newFilenames.delete(url);

          browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.runtime.getURL("icons/icon-48.png"),
            "title": "Download completed",
            "message": `Paper saved as ${filename}`
          });
        }
      }
    })();
  }
});

