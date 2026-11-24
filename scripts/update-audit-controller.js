const fs = require('fs');

// 1. Controller
let ctrl = fs.readFileSync('backend/src/controllers/audit.controller.js', 'utf8');
if (!ctrl.includes('getMarketingMetrics')) {
  ctrl = ctrl.trim() + `\n\nexport const getMarketingMetrics = async (req, res, next) => {
  try {
    const data = await auditService.getMarketingMetrics(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
`;
  fs.writeFileSync('backend/src/controllers/audit.controller.js', ctrl, 'utf8');
  console.log('Updated audit.controller.js');
}

// 2. Routes
let routes = fs.readFileSync('backend/src/routes/audit.routes.js', 'utf8');
if (!routes.includes('/marketing')) {
  routes = routes.replace(
    "router.get('/price-history', auditController.getPriceHistory);",
    "router.get('/price-history', auditController.getPriceHistory);\nrouter.get('/marketing', auditController.getMarketingMetrics);"
  );
  fs.writeFileSync('backend/src/routes/audit.routes.js', routes, 'utf8');
  console.log('Updated audit.routes.js');
}
