const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/checkout/CheckoutForm.jsx', 'utf8');

if (!content.includes('getStoredUTM')) {
  content = content.replace(
    "import { formatVariantDescription } from '../../context/CartContext';",
    "import { formatVariantDescription } from '../../context/CartContext';\nimport { getStoredUTM } from '../../utils/utmTracker';"
  );
  content = content.replace(
    "items: orderItems,",
    "items: orderItems,\n        ...getStoredUTM(),"
  );
  fs.writeFileSync('frontend/src/components/checkout/CheckoutForm.jsx', content, 'utf8');
  console.log('Successfully updated CheckoutForm.jsx with UTM support');
} else {
  console.log('Already updated');
}
