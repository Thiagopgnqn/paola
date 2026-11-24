const fs = require('fs');
let content = fs.readFileSync('backend/src/index.js', 'utf8');

if (!content.includes('newsletterRoutes')) {
  content = content.replace(
    "import homeSectionRoutes from './routes/homeSection.routes.js';",
    "import homeSectionRoutes from './routes/homeSection.routes.js';\nimport newsletterRoutes from './routes/newsletter.routes.js';"
  );
  content = content.replace(
    "app.use('/api/home-sections', homeSectionRoutes);",
    "app.use('/api/home-sections', homeSectionRoutes);\napp.use('/api/newsletter', newsletterRoutes);"
  );
  fs.writeFileSync('backend/src/index.js', content, 'utf8');
  console.log('Successfully updated backend/src/index.js');
} else {
  console.log('Already updated');
}
