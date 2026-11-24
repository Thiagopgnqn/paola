const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

if (!code.includes('MarketingDashboardPage')) {
  code = code.replace(
    "import CollectionsPage from './pages/admin/CollectionsPage';",
    "import CollectionsPage from './pages/admin/CollectionsPage';\nimport MarketingDashboardPage from './pages/admin/MarketingDashboardPage';"
  );

  const routeBlock = `            <Route
              path="/admin/marketing"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout title="Métricas y Atribución">
                    <MarketingDashboardPage />
                  </AdminLayout>
                </ProtectedAdminRoute>
              }
            />\n`;

  code = code.replace(
    '            <Route\n              path="/admin/campanas"',
    routeBlock + '            <Route\n              path="/admin/campanas"'
  );

  fs.writeFileSync('frontend/src/App.jsx', code, 'utf8');
  console.log('Successfully updated App.jsx with /admin/marketing route');
} else {
  console.log('Already updated');
}
