const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/admin/CampaignsPage.jsx', 'utf8');

if (!content.includes('CampaignShareModal')) {
  // Add FiShare2
  content = content.replace("  FiLayout,", "  FiLayout,\n  FiShare2,");
  // Add import CampaignShareModal
  content = content.replace(
    "import CampaignWizardModal from '../../components/admin/campaigns/CampaignWizardModal';",
    "import CampaignWizardModal from '../../components/admin/campaigns/CampaignWizardModal';\nimport CampaignShareModal from '../../components/admin/campaigns/CampaignShareModal';"
  );
  // Add state shareCampaign
  content = content.replace(
    "const [search, setSearch] = useState('');",
    "const [search, setSearch] = useState('');\n  const [shareCampaign, setShareCampaign] = useState(null);"
  );
  // Add Share button in card actions
  const targetBtn = `<FiGlobe size={14} />
                    </a>
                  )}`;
  const replacementBtn = `<FiGlobe size={14} />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setShareCampaign(camp)}
                    className="p-2 rounded-lg bg-surface-elevated text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors text-xs flex items-center gap-1.5"
                    title="Compartir con enlaces UTM y Código QR offline"
                  >
                    <FiShare2 size={14} />
                    <span className="hidden sm:inline font-medium">Compartir & QR</span>
                  </button>`;
  content = content.replace(targetBtn, replacementBtn);

  // Add CampaignShareModal before closing div
  const targetEnd = `{/* Modal Asistente en Pasos */}`;
  const replacementEnd = `{/* Modal Compartir UTM y QR */}
      {shareCampaign && (
        <CampaignShareModal
          campaign={shareCampaign}
          isOpen={Boolean(shareCampaign)}
          onClose={() => setShareCampaign(null)}
        />
      )}

      {/* Modal Asistente en Pasos */}`;
  content = content.replace(targetEnd, replacementEnd);

  fs.writeFileSync('frontend/src/pages/admin/CampaignsPage.jsx', content, 'utf8');
  console.log('Successfully updated CampaignsPage.jsx with CampaignShareModal');
} else {
  console.log('Already updated');
}
