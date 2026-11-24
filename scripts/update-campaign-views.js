const fs = require('fs');

// 1. Update campaign.service.js
let serv = fs.readFileSync('backend/src/services/campaign.service.js', 'utf8');
if (!serv.includes('incrementCampaignViews')) {
  const code = `
export const incrementCampaignViews = async (idOrSlug) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const existing = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: { id: true, views: true },
    });
    if (!existing) return null;
    const updated = await prisma.campaign.update({
      where: { id: existing.id },
      data: { views: { increment: 1 } },
      select: { id: true, slug: true, views: true },
    });
    return updated;
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    const camp = (snap.campaigns || []).find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (camp) {
      camp.views = (camp.views || 0) + 1;
      return { id: camp.id, slug: camp.slug, views: camp.views };
    }
    return null;
  }
};
`;
  serv = serv.trim() + '\n' + code;
  fs.writeFileSync('backend/src/services/campaign.service.js', serv, 'utf8');
  console.log('Updated campaign.service.js');
}

// 2. Update campaign.controller.js
let ctrl = fs.readFileSync('backend/src/controllers/campaign.controller.js', 'utf8');
if (!ctrl.includes('recordCampaignView')) {
  const code = `
export const recordCampaignView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await campaignService.incrementCampaignViews(id);
    res.json({ success: true, views: result?.views || 0 });
  } catch (err) {
    next(err);
  }
};

export const recordCampaignViewBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await campaignService.incrementCampaignViews(slug);
    res.json({ success: true, views: result?.views || 0 });
  } catch (err) {
    next(err);
  }
};
`;
  ctrl = ctrl.trim() + '\n' + code;
  fs.writeFileSync('backend/src/controllers/campaign.controller.js', ctrl, 'utf8');
  console.log('Updated campaign.controller.js');
}

// 3. Update campaign.routes.js
let routes = fs.readFileSync('backend/src/routes/campaign.routes.js', 'utf8');
if (!routes.includes('/:id/view')) {
  routes = routes.replace(
    "router.get('/public/:slug', campaignController.getPublicCampaignBySlug);",
    "router.get('/public/:slug', campaignController.getPublicCampaignBySlug);\nrouter.post('/:id/view', campaignController.recordCampaignView);\nrouter.post('/view/:slug', campaignController.recordCampaignViewBySlug);"
  );
  fs.writeFileSync('backend/src/routes/campaign.routes.js', routes, 'utf8');
  console.log('Updated campaign.routes.js');
}
