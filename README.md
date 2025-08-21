### About

arxivarius is Chromium extension that allows the user to download arXiv papers with custom, descriptive filenames.

The extension automatically renames pdf-files downloaded from *arxiv.org* according to a template parametrized by the paper's metadata (e.g., author, title, date, subject). This may help to keep a low-key file-based research library more organized.

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

There are two primary ways to install the extension.
- From the repository

    1. Clone the repository using Git:

        `git clone https://github.com/bshk003/arxivarius`

        Or download the zip file by clicking the "Code" button on the GitHub page and selecting "Download ZIP."

    2.  Open Chrome Extensions:

        Open Chrome. Navigate to `chrome://extensions/`.

    3.  Enable Developer Mode:

        In the top-right corner, toggle on "Developer mode".

    4.  Load the extension:

        Click the "Load unpacked" button that appears.

        Navigate to the directory where the repository was cloned or unzipped and select the main project folder, that being `arxivarius/chromium/src`.
        

- From a *.crx* file

    A packed *.crx* file is available in the `release/` directory in the repo.

    1. Upon downloading, open `chrome://extensions/`.

    2. Enable Developer Mode:

        In the top-right corner, toggle on "Developer mode".

    3.  Drag and drop the *.crx* file into the `chrome://extensions/` page. A prompt will appear to confirm the installation.

After installation, the settings page can be accessed by clicking the puzzle piece icon in the Chromium toolbar and selecting "*More options*" against the arxivarius entry. Alternatively, go to `chrome://extensions/` -> `arxivarius` -> `Details` -> `Extension options`.

### Further development

The current version relies on regular expressions to parse the paper's metadata from the arXiv abstract page, which is certainly not ideal. The approach was taken since the browser's DOMParser is not available within the background.js service worker, a limitation imposed by the Manifest V3 extension requirements.

An alternative solution will likely involve using an offscreen document to handle the HTML parsing in a more reliable way. The necessary functionality is provided by Chromium's offscreen API:

https://developer.chrome.com/docs/extensions/reference/api/offscreen
