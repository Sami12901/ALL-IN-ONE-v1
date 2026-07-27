// Schema Generator Logic

class SchemaGenerator {
  constructor() {
    this.typeSelect = document.getElementById('schema-type');
    this.fieldsContainer = document.getElementById('fields-container');
    this.outputBox = document.getElementById('output-code');
    this.btnCopy = document.getElementById('btn-copy');

    this.schemaConfigs = {
      'Article': [
        { id: 'art-headline', label: 'Headline', type: 'text', placeholder: 'Article Title' },
        { id: 'art-image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/img.jpg' },
        { id: 'art-author', label: 'Author Name', type: 'text', placeholder: 'John Doe' },
        { id: 'art-pub', label: 'Publisher Name', type: 'text', placeholder: 'My Awesome Blog' },
        { id: 'art-date', label: 'Date Published', type: 'date' }
      ],
      'LocalBusiness': [
        { id: 'lb-name', label: 'Business Name', type: 'text', placeholder: 'Bob\'s Burgers' },
        { id: 'lb-image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/logo.jpg' },
        { id: 'lb-phone', label: 'Telephone', type: 'tel', placeholder: '+1-555-555-5555' },
        { id: 'lb-street', label: 'Street Address', type: 'text', placeholder: '123 Main St' },
        { id: 'lb-city', label: 'City', type: 'text', placeholder: 'New York' }
      ],
      'Person': [
        { id: 'p-name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
        { id: 'p-url', label: 'Website URL', type: 'url', placeholder: 'https://johndoe.com' },
        { id: 'p-job', label: 'Job Title', type: 'text', placeholder: 'Software Engineer' },
        { id: 'p-company', label: 'Company', type: 'text', placeholder: 'Acme Corp' }
      ]
    };

    this.bindEvents();
    this.renderFields();
  }

  bindEvents() {
    this.typeSelect.addEventListener('change', () => {
      this.renderFields();
    });

    this.btnCopy.addEventListener('click', () => {
      if (!this.outputBox.textContent) return;
      navigator.clipboard.writeText(this.outputBox.textContent);
      const originalText = this.btnCopy.textContent;
      this.btnCopy.textContent = 'Copied!';
      setTimeout(() => this.btnCopy.textContent = originalText, 1500);
    });
  }

  renderFields() {
    const type = this.typeSelect.value;
    const fields = this.schemaConfigs[type];
    
    let html = '';
    fields.forEach(f => {
      html += `
        <div class="form-group">
          <label>${f.label}</label>
          <input type="${f.type}" id="${f.id}" class="form-input dynamic-input" placeholder="${f.placeholder || ''}">
        </div>
      `;
    });

    this.fieldsContainer.innerHTML = html;

    // Bind listeners to new inputs
    const inputs = this.fieldsContainer.querySelectorAll('.dynamic-input');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.generate());
    });

    this.generate();
  }

  generate() {
    const type = this.typeSelect.value;
    let schemaObj = {
      "@context": "https://schema.org",
      "@type": type
    };

    if (type === 'Article') {
      schemaObj.headline = document.getElementById('art-headline').value;
      schemaObj.image = document.getElementById('art-image').value ? [document.getElementById('art-image').value] : [];
      schemaObj.author = { "@type": "Person", "name": document.getElementById('art-author').value };
      schemaObj.publisher = { "@type": "Organization", "name": document.getElementById('art-pub').value };
      schemaObj.datePublished = document.getElementById('art-date').value;
    } 
    else if (type === 'LocalBusiness') {
      schemaObj.name = document.getElementById('lb-name').value;
      schemaObj.image = document.getElementById('lb-image').value;
      schemaObj.telephone = document.getElementById('lb-phone').value;
      schemaObj.address = {
        "@type": "PostalAddress",
        "streetAddress": document.getElementById('lb-street').value,
        "addressLocality": document.getElementById('lb-city').value
      };
    }
    else if (type === 'Person') {
      schemaObj.name = document.getElementById('p-name').value;
      schemaObj.url = document.getElementById('p-url').value;
      schemaObj.jobTitle = document.getElementById('p-job').value;
      schemaObj.worksFor = { "@type": "Organization", "name": document.getElementById('p-company').value };
    }

    let html = `<script type="application/ld+json">\n`;
    html += JSON.stringify(schemaObj, null, 2) + '\n';
    html += `</script>`;

    this.outputBox.textContent = html;
  }
}

window.schemaGenerator = new SchemaGenerator();