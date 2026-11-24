const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/home/DynamicSection.jsx', 'utf8');

if (!code.includes('NewsletterForm')) {
  code = "import NewsletterForm from '../newsletter/NewsletterForm';\n" + code;

  const newsletterBlock = `
  // =========================================================================
  // 9. NEWSLETTER
  // =========================================================================
  if (section.type === 'NEWSLETTER') {
    return (
      <section className="py-12 sm:py-16 bg-surface/30 border-y border-brand-border/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <NewsletterForm
            title={config.title || 'Suscribite a nuestro Newsletter'}
            subtitle={config.subtitle || 'Recibí ofertas exclusivas, lanzamientos y cupones de descuento directo en tu correo.'}
          />
        </div>
      </section>
    );
  }
`;

  code = code.replace('return null;\n};', newsletterBlock + '\n  return null;\n};');
  fs.writeFileSync('frontend/src/components/home/DynamicSection.jsx', code, 'utf8');
  console.log('Successfully updated DynamicSection.jsx with NEWSLETTER type');
} else {
  console.log('Already updated');
}
