# 🔧 Debug 401 Error di Browser - Frontend Checklist

## Quick Debug Steps

Jika masih dapat error 401 saat delete di browser, ikuti langkah ini:

### 1. Check Authorization Header Dikirim

**Buka DevTools (F12) → Network Tab:**
- Klik tab **Network**
- Coba delete material dari UI
- Cari request DELETE ke `/api/materials/...`
- Klik request tersebut
- Buka tab **Headers**

**Periksa:**
```
Request Headers section:
├─ authorization: Bearer <token>
└─ (jika tidak ada = MASALAH!)
```

### 2. Check Token di Storage

**Di Console (F12 → Console):**
```javascript
// Cek localStorage
localStorage.getItem('token')

// Cek sessionStorage  
sessionStorage.getItem('token')

// Cek apakah ada di cookies
document.cookie
```

**Expected Output:**
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMGFjMmI3..."
```

**If you see `null`:**
❌ Token tidak tersimpan setelah login
→ Frontend tidak menyimpan token dengan benar

### 3. Check Request Payload

**Network Tab → pilih DELETE request:**
- Tab **Headers**
- Scroll ke bawah ke "Request Headers"
- Periksa ada `authorization` atau tidak

### 4. Check Response

**Network Tab → pilih DELETE request:**
- Tab **Response**

**If 401:**
```json
{
  "message": "Token tidak ditemukan"
  // atau
  "message": "Token tidak valid"
  // atau  
  "message": "Token sudah expired"
}
```

## Common Issues & Solutions

### Issue 1: Authorization header tidak ada

**Gejala:**
```
Request Headers:
- method: DELETE
- authorization: (MISSING!)
- content-type: application/json
```

**Solusi Frontend:**
```javascript
// ❌ WRONG
const response = await fetch(`/api/materials/${id}`, {
  method: 'DELETE',
  // Lupa tambah headers!
});

// ✅ CORRECT
const response = await fetch(`/api/materials/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### Issue 2: Token di localStorage null

**Gejala:**
```javascript
localStorage.getItem('token') // null
```

**Kemungkinan Penyebab:**
1. Login tidak menyimpan token ke localStorage
2. localStorage di-clear (F12 → Application → Storage)
3. Browser menggunakan private/incognito mode (localStorage tidak persisten)

**Solusi:**
- Pastikan login response menyimpan token
- Tidak clear localStorage secara tidak sengaja
- Test di normal mode, bukan incognito

### Issue 3: Token format salah

**❌ WRONG:**
```javascript
headers: {
  'Authorization': token // ❌
}

// atau
headers: {
  'Authorization': `${token}` // ❌
}
```

**✅ CORRECT:**
```javascript
headers: {
  'Authorization': `Bearer ${token}` // ✅
}
```

### Issue 4: Token sudah expired

**Gejala:**
```json
{"message": "Token sudah expired"}
```

**Solusi:**
1. Login ulang untuk mendapatkan token baru
2. Atau implementasi refresh token

## Test dari Command Line

Untuk verify token sekarang valid, buka terminal dan jalankan:

```bash
node testSetupAndDelete.js
```

Jika output:
```
✅ DELETE SUCCESSFUL!
```

Maka backend OK, masalahnya di frontend token/headers.

## Frontend Code Examples

### Using Fetch API

```javascript
async function deleteMaterial(materialId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Silakan login terlebih dahulu');
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/materials/${materialId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Berhasil dihapus:', data.message);
      // Refresh daftar material
      loadMaterials();
    } else {
      console.error('❌ Gagal:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
```

### Using Axios

```javascript
async function deleteMaterial(materialId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Silakan login terlebih dahulu');
    return;
  }

  try {
    const response = await axios.delete(
      `/api/materials/${materialId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Berhasil:', response.data.message);
    loadMaterials(); // Refresh
  } catch (error) {
    if (error.response?.status === 401) {
      alert('Session expired, silakan login ulang');
      // Redirect ke login
    } else if (error.response?.status === 403) {
      alert('Anda tidak punya akses untuk menghapus');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}
```

## Network Tab Deep Dive

**Untuk lihat detail request/response:**

1. DevTools → Network
2. Lakukan delete di UI
3. Klik request `/api/materials/...` (DELETE method)
4. Buka tab-tab berikut:

| Tab | Yang Dilihat |
|-----|-------------|
| **Headers** | Request headers, termasuk Authorization |
| **Payload** | Request body (biasanya kosong untuk DELETE) |
| **Response** | Response dari server |
| **Timing** | Berapa lama request |

**Contoh Headers yang Benar:**
```
Request Headers:
authorization: Bearer eyJhbGc...
content-type: application/json
origin: http://localhost:5173
referer: http://localhost:5173/admin/materi

Response Headers:
content-type: application/json
```

## Checklist Final

- [ ] Authorization header ada di Network tab
- [ ] Format: `Bearer {token}`
- [ ] Token tidak undefined/null
- [ ] Bukan di browser incognito
- [ ] Login terlebih dahulu sebelum delete
- [ ] Status response 200 (bukan 401/403)

Kalau masih ada masalah, screenshot console error dan network tab request/response!
