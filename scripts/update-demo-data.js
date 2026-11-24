const fs = require('fs');
const path = 'frontend/src/api/demo/demo-data.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Add views to campaigns
data.campaigns = data.campaigns.map((c) => {
  if (c.slug === 'black-friday') return { ...c, views: c.views || 185 };
  if (c.slug === 'dia-de-la-madre') return { ...c, views: c.views || 94 };
  if (c.slug === 'navidad') return { ...c, views: c.views || 42 };
  return { ...c, views: c.views || 25 };
});

// 2. Add sample subscribers
data.subscribers = [
  {
    id: 'demo_sub_01',
    email: 'sofia.cordoba@ejemplo.com',
    consentGiven: true,
    consentDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    active: true,
    unsubscribedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'demo_sub_02',
    email: 'franco.m@ejemplo.com',
    consentGiven: true,
    consentDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    active: true,
    unsubscribedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'demo_sub_03',
    email: 'valeria.b@ejemplo.com',
    consentGiven: true,
    consentDate: new Date(Date.now() - 86400000 * 22).toISOString(),
    active: true,
    unsubscribedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 22).toISOString(),
  },
];

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated demo-data.json with views and subscribers');
