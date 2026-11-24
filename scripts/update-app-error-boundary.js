const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

if (!code.includes("import ErrorBoundary from './components/layout/ErrorBoundary';")) {
  code = code.replace(
    "import ScrollToTop from './components/ScrollToTop';",
    "import ScrollToTop from './components/ScrollToTop';\nimport ErrorBoundary from './components/layout/ErrorBoundary';"
  );
  code = code.replace(
    '<div className="max-w-7xl mx-auto">{children}</div>',
    '<div className="max-w-7xl mx-auto">\n            <ErrorBoundary>\n              {children}\n            </ErrorBoundary>\n          </div>'
  );
  fs.writeFileSync('frontend/src/App.jsx', code, 'utf8');
  console.log('Successfully wrapped admin content with ErrorBoundary in App.jsx');
} else {
  console.log('Already wrapped');
}
