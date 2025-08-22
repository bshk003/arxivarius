### About

arxivarius is a browser extension that allows the user to download arXiv papers with custom, descriptive filenames.

The extension automatically renames PDF files downloaded from arxiv.org according to a template that may depend on the paper's metadata (e.g., author, title, date, subject). This can help to keep a low-key file-based research library more organized.

There is a version for Chromium-based browsers and one for Firefox. The Firefox version uses the WebExtension API and should work with other browsers that support it. 

### The filename template format

The filename template is a string that may contain various tags representing paper's metadata.

| **Tag** | **Description** |
| :--- | :--- |
| `%a` | The full authors' names in the order of appearance |
| `%A` | The authors names in a shortened format (last name + initials) |
| `%f` | The full first author's name |
| `%F` | The first author's name in a shortened format (last name + initials) |
| `%i` | arXiv publication ID |
| `%s` | The primary subject code|
| `%t` | The title |
| `%Y`, `%M`, `%D` | The publication date (year, month, day) |

The default template is `%A-%t (%Y).pdf`.

A forward slash (`/`) can be used in the template to specify a path relative to the downloads directory. The forbidden filename characters (`\:*?"<>|`) are replaced by the underscore.  

A few (non-arxiv) examples:

1.  "Methodus inveniendi lineas curvas" by Leonhard Euler

    - Template: `%a-%Y-%t.pdf`
    - Filename: `Euler, Leonard-1744-Methodus inveniendi lineas curvas.pdf`

2.  "Disquisitiones Arithmeticae" by Carl Friedrich Gauss

    - Template: `[%s] %A-%t (%Y).pdf`
    - Filename: `[math.NT] Gauss, C.F.-Disquisitiones Arithmeticae (1801).pdf`

3. "Studies of Nonlinear Problems. I." by Enrico Fermi, John Pasta, and Stanislaw Ulam
    - Template: `%F-%t (%Y-%M).pdf`
    - Filename: `Fermi, E. et al.-Studies of Nonlinear Problems. I. (1955-05).pdf`
4. The forward slash in the template can be used to organize a directory structure. Note that it would be relative to the current download directory. For instance, a template of `%Y/%s/%F-%t.pdf` would create subdirectories based on the paper's year and subject.
```
downloads/
├── 1744/
│   └── math.OC/
│       └── Euler, L.-Methodus inveniendi lineas curvas.pdf
├── 1801/
│   └── math.NT/
│       └── Gauss, C.F.-Disquisitiones Arithmeticae.pdf
└── 1955/
    └── physics.comp-ph/
        └── Fermi, E. et al.-Studies of Nonlinear Problems. I..pdf
```


### Installation

For Chromium-based browsers (e.g., Chrome, Edge, Brave)

**1. From the repository:**

   1. Clone the repository
      ```bash
      git clone https://github.com/bshk003/arxivarius
      ```
      or download the zip file by clicking the "Code" button on the GitHub page and selecting "Download ZIP."
   2. Open Chrome and navigate to `chrome://extensions/`.
   3. In the top-right corner, enable *Developer mode*.
   4. Click the *Load unpacked* button.
   5. Select the main project folder: `arxivarius/chromium/src`.

**2. From a .crx file:**

   1. Download the packed `.crx` file from the `release/` directory in the repository.
   2. Open Chrome and navigate to `chrome://extensions/`.
   3. In the top-right corner, enable *Developer mode*.
   4. Drag and drop the `.crx` file into the `chrome://extensions/` page.
   5. Confirm the installation when prompted.

After installation, the settings page can be accessed by clicking the puzzle piece icon in the Chrome toolbar and selecting *More options* for the arxivarius entry. Alternatively, go to `chrome://extensions/` -> `arxivarius` -> `Details` -> `Extension options`.

#### Firefox

At the moment, only temporary installation is available. A temporary installation is valid only for the current browser session. 

**1. Temporary installation:**

   1. Navigate to `about:debugging#/runtime/this-firefox` in Firefox.
   2. Click **Load Temporary Add-on...**
   3. Select any file inside the `firefox/src/` directory.

A signed approval from Mozilla is pending.

### Requirements

The extension uses Manifest V3. For the Chromium-based browsers this is supported by version 88 and newer. For Firefox, this is supported by version 109 and newer.

### Further development

1. The current version relies on regular expressions to parse the paper's metadata from the arXiv abstract page, which is certainly not ideal. The approach was taken since the browser's DOMParser is not available within the background.js service worker, a limitation imposed by the Manifest V3 extension requirements.

    An alternative solution will likely involve using an offscreen document to handle the HTML parsing in a more reliable way. The necessary functionality is provided by Chromium's offscreen API:

    https://developer.chrome.com/docs/extensions/reference/api/offscreen

2. Due to limitations of the WebExtension API, the current Firefox version does not support automatic file renaming when a download is initiated from the browser's built-in pdf-viewer. Some workaround is needed.
