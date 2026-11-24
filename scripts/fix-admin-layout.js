const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const target = `<ProtectedAdminRoute>
                  <AdminLayout title="Métricas y Atribución">
                    <MarketingDashboardPage />
                  </AdminLayout>
                </ProtectedAdminRoute>`;

const replacement = `<ProtectedAdminRoute>
                  <MarketingDashboardPage />
                </ProtectedAdminRoute>`;

if (code.includes('AdminLayout')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('frontend/src/App.jsx', code, 'utf8');
  console.log('Successfully removed AdminLayout from App.jsx');
} else {
  console.log('AdminLayout not found in App.jsx');
}
