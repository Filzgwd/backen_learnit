// 🔍 DEBUGGING SCRIPT - Jalankan di Browser Console
// Copy-paste semua code ini ke console browser (F12) saat di halaman admin materi

console.log('🔍 DEBUG: Delete Material Request\n');

// 1. CHECK TOKEN
const token = localStorage.getItem('token');
console.log('1️⃣ Token dari localStorage:');
if (token) {
  console.log('   ✅ Token ada');
  console.log('   First 50 chars:', token.substring(0, 50) + '...');
  console.log('   Length:', token.length);
} else {
  console.log('   ❌ TOKEN TIDAK ADA DI LOCALSTORAGE!');
  console.log('   Ini adalah penyebab 401 error!');
}

// 2. GET FIRST MATERIAL ID
console.log('\n2️⃣ Material dari DOM:');
const materialButtons = document.querySelectorAll('[data-material-id], button[onclick*="delete"]');
console.log('   Found', materialButtons.length, 'potential material buttons');

if (materialButtons.length > 0) {
  const firstBtn = materialButtons[0];
  console.log('   First button text:', firstBtn.textContent);
  console.log('   Data attribute:', firstBtn.getAttribute('data-material-id'));
  console.log('   onclick:', firstBtn.getAttribute('onclick'));
}

// 3. TEST DELETE REQUEST MANUALLY
console.log('\n3️⃣ Manual DELETE Request Test:');
console.log('   Preparing to send test request...\n');

// Ambil material ID dari list yang ditampilkan (adjust selector sesuai aplikasi Anda)
const materialRows = document.querySelectorAll('table tbody tr'); // Adjust selector if needed
if (materialRows.length > 0) {
  const firstRow = materialRows[0];
  console.log('   Found material row:', firstRow.textContent.substring(0, 50));
  
  // Coba cari ID dari berbagai tempat
  let materialId = null;
  
  // Try berbagai selector untuk ID
  const idCell = firstRow.querySelector('td:first-child');
  if (idCell) {
    materialId = idCell.textContent.trim();
    console.log('   Material ID:', materialId);
  }
}

// 4. MONITOR NETWORK REQUESTS
console.log('\n4️⃣ Network Monitoring:');
console.log('   Tips: Buka DevTools → Network tab → Coba delete material');
console.log('   Cari request dengan method DELETE');
console.log('   Lihat:');
console.log('     - Status code (harus 200 jika success)');
console.log('     - Headers → Authorization (harus ada "Bearer {token}")');
console.log('     - Request body (jika ada)');
console.log('     - Response body');

// 5. INTERCEPT DELETE CALLS
console.log('\n5️⃣ Intercepting fetch/axios calls...');

const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [resource, config] = args;
  
  // Log DELETE requests
  if (config?.method === 'DELETE' || (typeof resource === 'string' && resource.includes('/api/materials'))) {
    console.log('\n🚨 INTERCEPTED DELETE REQUEST:');
    console.log('   URL:', resource);
    console.log('   Method:', config?.method || 'DELETE');
    console.log('   Headers:', config?.headers || 'None');
    console.log('   Body:', config?.body || 'None');
  }
  
  return originalFetch.apply(this, args);
};

console.log('\n   ✅ Fetch interceptor activated');
console.log('   Try delete material now - see log above\n');

// 6. CHECK LOCAL STORAGE
console.log('6️⃣ Full localStorage content:');
console.log('   Keys:', Object.keys(localStorage));
for (let key of Object.keys(localStorage)) {
  let value = localStorage.getItem(key);
  if (value.length > 100) {
    console.log(`   ${key}: ${value.substring(0, 100)}...`);
  } else {
    console.log(`   ${key}: ${value}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('✨ Debugging script loaded! Try delete material now');
console.log('='.repeat(70));
