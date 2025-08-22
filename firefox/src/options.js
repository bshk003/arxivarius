import { formatFilename } from './utils.js';

// Pre-filled metadata for a concrete example (the EPR paper).
const previewMetaTags = {
  citation_title: "Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?",
  citation_arxiv_id: "3505.31415",
  citation_date_year: "1935",
  citation_date_month: "05",
  citation_date_day: "15",
  citation_author_full: "Einstein, Albert; Podolsky, Boris Yakovlevich; Rosen, Nathan",
  citation_author_initials: "Einstein, A.; Podolsky, B.Y.; Rosen, N.",
  citation_author_first_full: "Einstein, Albert et al.",
  citation_author_first_initials: "Einstein, A. et al.",
  primary_subject: "quant-ph"
};

const updatePreview = () => {
  const template = document.getElementById('template').value;
  const filename = formatFilename(template, previewMetaTags);
  document.getElementById('preview-filename').textContent = filename;
};

const saveOptions = () => {
  const filenameTemplate = document.getElementById('template').value;
  chrome.storage.sync.set({ filenameTemplate }, () => {
    const status = document.getElementById('status-message');
    status.textContent = 'Settings saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 1500);
  });
};

const restoreOptions = () => {
  chrome.storage.sync.get({ filenameTemplate: '%A-%t (%Y).pdf' }, (items) => {
    document.getElementById('template').value = items.filenameTemplate;
    updatePreview();
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-button').addEventListener('click', saveOptions);
document.getElementById('template').addEventListener('input', updatePreview);


// function save_options() {
//   var fnformat = document.getElementById("fnformat").value;
//   chrome.storage.local.set({"fnformat": fnformat});
//   document.getElementById("status").textContent = "New format saved."; 
// }

// function restore_options() {
//   chrome.storage.local.get({
//     "fnformat": "%a - %t (%y)"}, 
//     function(items) {
//     document.getElementById("fnformat").value = items.fnformat;
//   });
// }

// document.addEventListener("DOMContentLoaded", restore_options);
// document.getElementById("save").addEventListener("click", save_options);
// document.getElementById("fnformat").addEventListener("keyup", function() {document.getElementById("status").textContent = ""} );