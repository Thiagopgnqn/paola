const fs = require('fs');
let code = fs.readFileSync('frontend/src/api/demo/demoAdapter.js', 'utf8');

if (!code.includes('computeMarketingMetrics,\n  DEFAULT_PRICE_HISTORY_DAYS')) {
  code = code.replace(
    '  DEFAULT_PRICE_HISTORY_DAYS,',
    '  computeMarketingMetrics,\n  DEFAULT_PRICE_HISTORY_DAYS,'
  );
  // Remove the inline duplicate computeMarketingMetrics if present
  if (code.includes('export function computeMarketingMetrics(')) {
    const startIdx = code.indexOf('export function computeMarketingMetrics(');
    const endIdx = code.indexOf('export const handleDemoRequest = async (config) => {');
    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
      code = code.slice(0, startIdx) + code.slice(endIdx);
    }
  }
  fs.writeFileSync('frontend/src/api/demo/demoAdapter.js', code, 'utf8');
  console.log('Updated demoAdapter.js imports');
} else {
  console.log('Already updated');
}
