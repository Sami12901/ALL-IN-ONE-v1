# ALL IN ONE — 188+ Free Client-Side Browser Utilities

ALL IN ONE is a premium, lightweight, offline-ready, and privacy-focused collection of web-based utilities designed for ALL TYPE USER. 

The entire application runs **100% client-side** inside the browser sandbox. No input is ever transmitted to a remote server, ensuring complete data privacy and zero tracking.

Live URL: **[https://sami12901.github.io/ALL-IN-ONE-v1/](https://sami12901.github.io/ALL-IN-ONE-v1/)**

---

## Key Features

- **188+ Utilities Scheduled**: Structured across 12 distinct categories (Text, Developer, SEO, Colors, Converter, Math, Utility, and more).
- **Frameworkless & Lightweight**: Built strictly using pure HTML5, Vanilla CSS3, and Vanilla JavaScript. Zero bundlers, compile phases, or external framework dependencies.
- **PWA (Progressive Web App)**: Complete offline support via a custom cache-first Service Worker (`sw.js`). Installable directly onto mobile or desktop home screens.
- **Premium User Interface**: Modern design featuring fluid dark/light mode switches, glassmorphic card patterns, harmonized HSL color tokens, and custom-designed inline SVG icons (100% emoji-free).
- **Fuzzy Search & Filtering**: Client-side instant query matching and category tab filtering with favorites list capability.
- **Search Engine Optimized**: Fully loaded with canonical references, structured JSON-LD schemas, sitemaps, and optimized search meta tags for maximum organic ranking.

---

## Currently Active Functional Tools

1. **Word Counter**: Count words, reading time, and speaking duration.
2. **Character Counter**: Count characters, whitespace, and byte sizes.
3. **Text Case Converter**: Convert text between UPPERCASE, lowercase, Title Case, etc.
4. **Lorem Ipsum Generator**: Generate placeholder text with custom counts.
5. **Text Reverser**: Reverse characters, words, or full sentences.
6. **Find and Replace**: Search and replace text patterns using string or regex.
7. **HTML to Markdown Converter**: Extract markdown structure from HTML markup.
8. **Sentence Counter**: Count total sentence fragments in a text.
9. **JSON Formatter**: Format, validate, minfy, and beautify JSON data.
10. **Base64 Encoder**: Convert text or files to Base64 format.
11. **Base64 Decoder**: Decode Base64 strings back to text or files.
12. **QR Code Generator**: Generate custom QR codes for URLs, text, and contacts.
13. **Image Resizer & Compressor**: Resize and compress images to WebP/PNG/JPG.
14. **Password Generator**: Create secure random passwords.
15. **Invoice Generator**: Creates print-ready HTML billing invoice listings.
16. **Color Picker**: Visual canvas palette picker with format conversions.
17. **BMI Calculator**: Calculate Body Mass Index and health categories.
18. **HTML Output Viewer**: Live preview and test raw HTML, CSS, and JS code in an isolated sandbox.
19. **Visa Fee Calculator**: Calculate total visa processing costs.
20. **Passport Expiry Checker**: Batch check passport expiration dates.
21. **Travel Quotation Generator**: Generate custom tour and travel quotes.
22. **Tour Package Builder**: Build and price comprehensive tour packages.
23. **Product Profit Calculator**: Calculate net profit per product sold.
24. **Order Analyzer**: Analyze order volumes and trends.
25. **Sales Analyzer**: Deep dive into store sales performance.
26. **Inventory Analyzer**: Monitor inventory turnover and levels.
27. **Stock Alert Tool**: Generate low stock warnings and alerts.
28. **Product Catalog Generator**: Create digital catalogs from product lists.
29. **Invoice Generator**: Generate order invoices for customers.
30. **Receipt Generator**: Create digital purchase receipts.
31. **Shipping Calculator**: Estimate shipping costs by weight and region.
32. **Brand Identity Kit Generator**: Create comprehensive luxury brand guidelines.
33. **Pricing Strategy Calculator**: Formulate premium pricing strategies.
34. **VIP Client Analyzer**: Analyze purchasing habits of high-net-worth clients.
35. **Smart Business Analyzer**: Parse, analyze, and chart business data natively.

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
