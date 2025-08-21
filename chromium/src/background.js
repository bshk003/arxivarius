import { formatFilename, getArxivTags } from './utils.js';

// The main listener. This is triggered before the "Save as..." dialog appears.
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {

  const urlMatch = downloadItem.url.match(/arxiv\.org\/pdf\/(\d+\.\d+)(?:v\d+)?(?:\.pdf)?$/);

  if (urlMatch) {
    const arxivId = urlMatch[1];
    const absUrl = `https://arxiv.org/abs/${arxivId}`;

    (async () => {
      const metaTags = await getArxivTags(absUrl);

      chrome.storage.sync.get({ filenameTemplate: '%A-%t (%Y).pdf' }, (items) => {
        const newFilename = formatFilename(items.filenameTemplate, metaTags);
        suggest({ filename: newFilename });
      });
      
    })();

    return true;
  }
  suggest();
});
