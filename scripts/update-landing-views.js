const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/CampaignLandingPage.jsx', 'utf8');

if (!code.includes('viewed_camp_')) {
  code = code.replace(
    'setCampaign(res.data);',
    `setCampaign(res.data);
          // Registrar visita anónima a la campaña (1 vez por sesión)
          if (!previewParam && res.data?.id) {
            const viewedKey = \`viewed_camp_\${res.data.id}\`;
            if (!sessionStorage.getItem(viewedKey)) {
              sessionStorage.setItem(viewedKey, '1');
              client.post(\`/campaigns/\${res.data.id}/view\`).catch(() => {});
            }
          }`
  );
  fs.writeFileSync('frontend/src/pages/CampaignLandingPage.jsx', code, 'utf8');
  console.log('Successfully updated CampaignLandingPage.jsx with anonymous view tracking');
} else {
  console.log('Already updated');
}
