const fs = require('fs');
let code = fs.readFileSync('backend/src/services/audit.service.js', 'utf8');

if (!code.includes("import { computeMarketingMetrics }")) {
  code = "import { computeMarketingMetrics } from '../../../packages/pricing-engine/index.js';\n" + code;
  code = code.replace(
    'return computeMetricsFromData({ orders, campaigns, coupons, range, start, end });',
    'return computeMarketingMetrics({ orders, campaigns, coupons, range, start, end });'
  );
  code = code.replace(
    'return computeMetricsFromData({ orders, campaigns, coupons, range, start, end });',
    'return computeMarketingMetrics({ orders, campaigns, coupons, range, start, end });'
  );
  fs.writeFileSync('backend/src/services/audit.service.js', code, 'utf8');
  console.log('Updated audit.service.js to use shared computeMarketingMetrics');
} else {
  console.log('Already updated');
}
