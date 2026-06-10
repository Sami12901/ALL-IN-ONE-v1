# ALL IN ONE — 150+ Free Client-Side Browser Utilities

ALL IN ONE is a premium, lightweight, offline-ready, and privacy-focused collection of web-based utilities designed for developers, designers, writers, students, and freelancers. 

The entire application runs **100% client-side** inside the browser sandbox. No input is ever transmitted to a remote server, ensuring complete data privacy and zero tracking.

Live URL: **[https://sami12901.github.io/ALL-IN-ONE-v1/](https://sami12901.github.io/ALL-IN-ONE-v1/)**

---

## Key Features

- **150+ Utilities Scheduled**: Structured across 12 distinct categories (Text, Developer, SEO, Colors, Converter, Math, Utility, and more).
- **Frameworkless & Lightweight**: Built strictly using pure HTML5, Vanilla CSS3, and Vanilla JavaScript. Zero bundlers, compile phases, or external framework dependencies.
- **PWA (Progressive Web App)**: Complete offline support via a custom cache-first Service Worker (`sw.js`). Installable directly onto mobile or desktop home screens.
- **Premium User Interface**: Modern design featuring fluid dark/light mode switches, glassmorphic card patterns, harmonized HSL color tokens, and custom-designed inline SVG icons (100% emoji-free).
- **Fuzzy Search & Filtering**: Client-side instant query matching and category tab filtering with favorites list capability.
- **Search Engine Optimized**: Fully loaded with canonical references, structured JSON-LD schemas, sitemaps, and optimized search meta tags for maximum organic ranking.

---

## Currently Active Functional Tools

1. **Password Generator**: Secure cryptographically strong key generator with customizable complexity rules and Shannon entropy meters.
2. **QR Code Generator**: Local QR generator supporting sizing, custom foreground/background colors, and PNG downloads.
3. **Text Case Converter**: Supports Sentence Case, Title Case, UPPERCASE, lowercase, camelCase, and snake_case formatting.
4. **Word Counter**: Live metrics counting words, characters, sentences, and estimated reading/speaking speeds.
5. **Character Counter**: Emoji-safe visual glyph matching alongside raw UTF-8 byte calculations.
6. **JSON Formatter**: Syntax-highlighted output viewer, error alerts, minification, and one-click copy.
7. **Base64 Encoder**: Drag-and-drop file drops or text inputs encoded directly to base64 strings.
8. **Base64 Decoder**: Instantly decode base64 strings back to text or write downloadable binary file blobs.
9. **Color Picker**: Saturation-lightness canvas picker, custom eyedropper integrations, and format exports (HEX, RGB, HSL).
10. **BMI Calculator**: Metric/Imperial toggles, sliding body weight/height gauges, and dynamic weight classification meters.

---

## Directory Architecture

```text
├── assets/
│   ├── icons/             # PWA app icons and favicon
│   ├── images/            # Brand logos
│   └── lib/               # Local third-party library stubs (e.g. qrious.min.js)
├── css/
│   ├── main.css           # Global theme properties and styling resets
│   ├── dashboard.css      # Styling for index dashboard panels
│   └── tools-shared.css   # General utility workspaces and form styling
├── js/
│   ├── components.js      # Global custom HTML web components (header, footer, crumbs)
│   ├── main.js            # PWA registration and global shortcuts
│   └── dashboard.js       # Live search and favorites manager
├── data/
│   └── tools-db.json      # JSON catalog cataloging all 150 tools
├── pages/                 # Informative pages (About, Contact, Privacy, Terms)
├── tools/                 # Scaffolding directories for all 150 tools
├── sw.js                  # Root PWA Service Worker
├── pwa/                   # Web manifest configuration
├── seo/                   # Sitemap config and verification files
├── generate-sitemap.js    # Script to auto-compile sitemap.xml
└── scaffold.js            # Tool scaffold generator
```

---

## Local Development & Testing

Since the project operates as a static client-side web application, you do not need database configurations or compile steps. Simply serve the workspace root:

1. Clone the repository:
   ```bash
   git clone https://github.com/Sami12901/ALL-IN-ONE-v1.git
   cd ALL-IN-ONE-v1
   ```

2. Run a local web server (e.g., using Python):
   ```bash
   python -m http.server 8080
   ```

3. Open **`http://localhost:8080`** in your browser.

---

## Deployment

Deploying is as simple as pushing to GitHub. GitHub Pages is pre-configured to host the site directly from the root of the `master` branch.

To trigger a manual deploy:
1. Stage your changes: `git add .`
2. Commit: `git commit -m "feat: updates"`
3. Push: `git push origin master`

---

## Developer

**Sami (Sami12901)**  
GitHub Profile: [https://github.com/Sami12901](https://github.com/Sami12901)

---

## License

This project is open-source and released under the [MIT License](LICENSE). Feel free to use, customize, and extend it as needed.
