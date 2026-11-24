const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/admin/AdminSidebar.jsx', 'utf8');

if (!code.includes("to: '/admin/marketing'")) {
  code = code.replace("  FiLayout,", "  FiLayout,\n  FiTrendingUp,");
  code = code.replace(
    "const marketingItems = [",
    "const marketingItems = [\n    { name: 'Métricas & Atribución', to: '/admin/marketing', icon: FiTrendingUp },"
  );
  fs.writeFileSync('frontend/src/components/admin/AdminSidebar.jsx', code, 'utf8');
  console.log('Successfully updated AdminSidebar.jsx with /admin/marketing link');
} else {
  console.log('Already updated');
}
