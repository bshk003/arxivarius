// The data to fetch from an arxiv abstract page are the metatags of the form <meta name="<parameter>" content="<value>">,
// and the "primary-subject" value. E.g. "math.PR" from <span class="primary-subject">Probability (math.PR)</span>;.

// Warning: this is subject to the specific arxiv.org/abs/<page> HTML structure.
const METADATA_CONFIG = {
  citation_title: {
    regex: /<meta\s+name="citation_title"\s+content="([^"]+)"\s*\/?>/,
    isMultiValued: false,
  },
  citation_arxiv_id: {
    regex: /<meta\s+name="citation_arxiv_id"\s+content="([^"]+)"\s*\/?>/,
    isMultiValued: false,
  },
  citation_date: {
    regex: /<meta\s+name="citation_date"\s+content="([^"]+)"\s*\/?>/,
    isMultiValued: false,
    postProcessor: splitDate,
  },
  citation_author: {
    regex: /<meta\s+name="citation_author"\s+content="([^"]+)"\s*\/?>/g,
    isMultiValued: true,
    postProcessor: getNames,
  },
  primary_subject: {
    regex: /<span class="primary-subject">.*?\(([\w-]+\.[\w-]+)\).*?<\/span>/,
    isMultiValued: false,
  },
};

// Fetch the abstract page and extract metadata using the
// patterns defined in METADATA_CONFIG.
export const getArxivTags = async (absUrl) => {
  try {
    const response = await fetch(absUrl);
    if (!response.ok) {
      throw new Error(`Error why loading ${absUrl}: ${response.statusText}`);
    }
    const html = await response.text();
    const metaTags = {};

    for (const tag in METADATA_CONFIG) {
      const {regex, isMultiValued, postProcessor} = METADATA_CONFIG[tag];
      if (isMultiValued) {
        metaTags[tag] = [];
        // For multivalued tags, grab all the matches.
        for (const match of html.matchAll(regex)) {
          metaTags[tag].push(match[1]);
        }
      } // Otherwise, take the first match. 
        else {
        const match = html.match(regex);
        if (match && match[1]) {metaTags[tag] = match[1];}
      }
      if (postProcessor) {
        const processedValue = postProcessor(metaTags[tag]);
        Object.assign(metaTags, processedValue);
      }
    }
    return metaTags;
  } catch (error) {
    console.error("Error during fetch and parse:", error);
    return {};
  }
};

// Map of user-facing tags to the final metadata keys
export const FILENAME_TAGS = {
  '%t': 'citation_title',
  '%i': 'citation_arxiv_id',
  '%Y': 'citation_date_year',
  '%M': 'citation_date_month',
  '%D': 'citation_date_day',
  '%f': 'citation_author_first_full',
  '%F': 'citation_author_first_initials',
  '%a': 'citation_author_full',
  '%A': 'citation_author_initials',
  '%s': 'primary_subject',
};


function splitDate(dateStr) {
  const parts = dateStr.split('/');
    return {
      'citation_date_year': parts[0] || 'YYYY',
      'citation_date_month': parts[1] || 'MM',
      'citation_date_day': parts[2] || 'DD',
    };
} 

function getNames(citation_author) {
  const authorsNames = Array.isArray(citation_author) ? citation_author : [citation_author];
  let firstAuthorName = authorsNames[0] || '';

  const authorsInitials = authorsNames.map(author => getInitials(author));
  let firstAuthorInitials = getInitials(firstAuthorName); 

  if (authorsNames.length > 1) {
        firstAuthorName = `${firstAuthorName} et al.`;
        firstAuthorInitials = `${firstAuthorInitials} et al.`;
    }

  return {
    'citation_author_full': authorsNames.join('; '), // All authors, full names
    'citation_author_initials': authorsInitials.join('; '), // All authors, last-name-initials format
    'citation_author_first_full': firstAuthorName, // First author, full name
    'citation_author_first_initials': firstAuthorInitials, // First author, last-name-initials format
  };
} 

function getInitials(authorName) {
      let lastName = '';
      let initials = '';
      // An author's name is given in the "Last, First" format (the middle name is attached to First)
      if (authorName.includes(',')) {
        const parts = authorName.split(',').map(part => part.trim());
        lastName = parts[0];
        const remainingParts = parts[1].split(/\s+/).filter(Boolean);
        initials = remainingParts.map(part => part.charAt(0) + '.').join('');
      } else {
        // Fallback to the "First Last" format. This should not happen normally.
        const nameParts = authorName.trim().split(/\s+/);
        lastName = nameParts.pop();
        initials = nameParts.map(part => part.charAt(0)).join('');
      }
      return `${lastName}, ${initials}`;
    };

const sanitizeFilename = (str) => {
  const invalidCharsRegex = /[\\:*?"<>|]/g;
  return str.replace(invalidCharsRegex, '_');
};

// Format the filename based on the template and metadata.
// Order of precedence: escape symbols %% are handled before tags.
// Invalid appearances of % are dropped.
export const formatFilename = (template, metaTags) => {

  let filename = template.replace(/%%/g, '__PERCENT_PLACEHOLDER__');

  for (const tag in FILENAME_TAGS) {
    const key = FILENAME_TAGS[tag];
    let value = metaTags[key] || 'undefined';

    const tagRegex = new RegExp(tag, 'g');
    filename = filename.replace(tagRegex, value);
  }
  
  filename = filename.replace(/%/g, '');
  filename = filename.replace(/__PERCENT_PLACEHOLDER__/g, '%');

  return sanitizeFilename(filename);
};