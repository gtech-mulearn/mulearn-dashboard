---
"mulearn-dashboard": patch
---

author: @awindsr

Pages load less JavaScript: the build now leaves out the parts of a feature that a page doesn't use. Every dashboard page's first load is 107 to 342 kB smaller (gzipped).
