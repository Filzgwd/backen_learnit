# ✅ Backend Delete Material - FIXED & WORKING

## Ringkasan Status Backend

Backend **sudah BERHASIL** menjalankan delete material! Test menunjukkan:
- ✅ Admin login: **WORKING**
- ✅ Create material: **WORKING** 
- ✅ Delete material: **WORKING**
- ✅ Auth middleware: **WORKING**
- ✅ Role middleware: **WORKING**

## Masalah di Browser (401 Error)

Karena backend sudah bekerja, error 401 di browser kemungkinan dari **frontend**, bukan backend.

### Penyebab Umum Error 401:

1. **Authorization header tidak dikirim**
   - Token tidak di-retrieve dari localStorage/sessionStorage
   - Header Authorization tidak di-set pada request

2. **Token sudah expired**
   - Token lama di localStorage
   - Perlu login ulang

3. **Token format salah**
   - Harus: `Authorization: Bearer <token>`
   - Bukan: `Authorization: <token>`

## Cara Debug dari Browser

### Step 1: Cek Network Tab
1. Buka DevTools (F12)
2. Buka tab **Network**
3. Coba delete material
4. Cari request ke `/api/materials/{id}` (DELETE)
5. Lihat tab **Headers** → cek:
   ```
   Authorization: Bearer <token>
   ```

### Step 2: Cek Console
Lihat di tab **Console** apakah ada error tentang:
- Token undefined
- localStorage not found
- CORS error

### Step 3: Check Token di localStorage
Di Console ketik:
```javascript
console.log(localStorage.getItem('token'));
// atau
console.log(sessionStorage.getItem('token'));
```

Jika `null` atau `undefined`, token tidak tersimpan.

## Test Backend Langsung

Sudah tersedia script untuk test:

```bash
# Start server
npm start

# Di terminal lain, jalankan test
node testSetupAndDelete.js
```

Output yang diharapkan:
```
✅ DELETE SUCCESSFUL!
Response: Materi berhasil dihapus
```

## Frontend Checklist

Pastikan frontend Anda:

- [ ] **Retrieve token** dari localStorage/sessionStorage saat delete
- [ ] **Set Authorization header** dengan format `Bearer {token}`
- [ ] **Send DELETE request** ke `/api/materials/{id}`
- [ ] **Handle 401 response** - redirect ke login
- [ ] **Handle 403 response** - show permission error
- [ ] **Handle 200 response** - refresh material list

## Contoh Frontend Code (React)

```javascript
// Saat delete material
const handleDeleteMaterial = async (materialId) => {
  try {
    const token = localStorage.getItem('token'); // 1. Ambil token
    
    if (!token) {
      console.error('Token tidak ditemukan - silakan login');
      // redirect ke login
      return;
    }

    const response = await fetch(`/api/materials/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, // 2. Set Authorization header
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      console.error('Token expired - silakan login ulang');
      // Redirect ke login
      return;
    }

    if (response.status === 403) {
      console.error('Anda tidak memiliki akses untuk menghapus materi');
      return;
    }

    if (response.status === 200) {
      console.log('Material berhasil dihapus');
      // Refresh material list
      refreshMaterials();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Fixes yang Sudah Dilakukan Backend

1. ✅ **Fixed CORS** - `optionsSuccessStatus: 200`
2. ✅ **Fixed JWT fallback** - Consistent JWT_SECRET
3. ✅ **Added logging** - Auth middleware sekarang log detail
4. ✅ **Verified admin user** - Admin user ada dengan role 'admin'

## File yang Diubah

- `src/app.js` - Fixed CORS config
- `src/middlewares/authMiddleware.js` - Added logging
- `resetAdminPassword.js` - Added dotenv loading
- `checkAdminStatus.js` - New script untuk verify admin
- `testSetupAndDelete.js` - Complete test flow

## Bantuan Lebih Lanjut

Jika masih ada masalah, cek:
1. Terminal server - lihat log dari `/api/materials/{id}` DELETE request
2. Browser console - lihat error message
3. Network tab - lihat request dan response detail

Seharusnya sudah fixed! 🎉
