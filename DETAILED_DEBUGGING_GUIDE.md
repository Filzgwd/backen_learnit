# 🔍 DEBUGGING DELETE MATERIAL ERROR 500

## 📍 Status Terkini

✅ **Backend DELETE bekerja sempurna** (sudah ditest)
❌ **Frontend masih dapat error 500**

**Kesimpulan: Masalah ada di cara frontend mengirim request, bukan di backend**

---

## 🛠️ LANGKAH DEBUGGING (STEP BY STEP)

### STEP 1: Buka DevTools di Browser
1. Buka halaman admin: https://learnit-id.vercel.app/admin/materi
2. Tekan **F12** untuk buka DevTools
3. Pergi ke tab **Console**

### STEP 2: Jalankan Debug Script
1. Copy seluruh code dari `FRONTEND_DEBUG_CONSOLE.js`
2. Paste di Console browser
3. Tekan Enter

**Output akan menunjukkan:**
- ✅ Token ada / ❌ Token tidak ada
- ID material dari DOM
- Status localStorage

### STEP 3: Monitor Network Tab
1. Di DevTools, buka tab **Network**
2. Jangan tutup console
3. Coba delete material dari UI

**Lihat di Network tab:**
- Request ke `/api/materials/{id}` dengan method **DELETE**
- Cek Status code (harus 200 jika success)
- Lihat **Request Headers** → Cek Authorization header

### STEP 4: Check Authorization Header
**IMPORTANT**: Di Network tab, klik request DELETE, lihat tab **Headers**

Cari bagian **Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...  ✅ BENAR
```

atau

```
(tidak ada) ❌ SALAH - INI MASALAHNYA!
```

---

## 🎯 Kemungkinan Penyebab (Berdasarkan Yang Paling Sering)

### ❌ Penyebab #1: Token Tidak Dikirim (PALING SERING)
**Ciri-ciri:**
- Response error 401 atau 500
- Authorization header kosong di Network tab
- Token ada di console tapi tidak dikirim

**Solusi:**
Cek kode delete di frontend, pastikan:
```javascript
// BENAR:
const token = localStorage.getItem('token');
const response = await fetch(`/api/materials/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,  // ← TOKEN HARUS DIKIRIM
    'Content-Type': 'application/json',
  },
});

// SALAH:
const response = await fetch(`/api/materials/${id}`, {
  method: 'DELETE',
  // ← TOKEN TIDAK DIKIRIM!
});
```

---

### ❌ Penyebab #2: Material ID Format Berbeda
**Ciri-ciri:**
- Test script PASS (tapi ada material di DB)
- User delete tetap error 500
- Material ID mungkin integer, bukan UUID

**Solusi:**
Di console, cek format material ID:
```javascript
// Console:
const rows = document.querySelectorAll('table tbody tr');
console.log('First material ID:', rows[0].querySelector('td').textContent);
```

**Harus UUID format:** `550e8400-e29b-41d4-a716-446655440000`

Jika integer, maka ada issue dengan ID di database.

---

### ❌ Penyebab #3: Token Expired
**Ciri-ciri:**
- Response 401 "Token expired"
- Token lama di localStorage
- Perlu login ulang

**Solusi:**
```javascript
// Di console, lihat token expiry
const token = localStorage.getItem('token');
if (token) {
  // Decode token (tanpa verify, hanya untuk lihat)
  const parts = token.split('.');
  const decoded = JSON.parse(atob(parts[1]));
  console.log('Token expires at:', new Date(decoded.exp * 1000));
}
```

---

### ❌ Penyebab #4: Frontend Parsing Error
**Ciri-ciri:**
- Request tidak dikirim sama sekali
- Console ada error JavaScript

**Solusi:**
Cek console untuk red error messages. Solusi tergantung error message.

---

## 📋 Checklist Debug

- [ ] DevTools terbuka (F12)
- [ ] Console menunjukkan token ada ✅ atau tidak ❌
- [ ] Network tab menunjukkan request DELETE
- [ ] Request Headers punya Authorization header
- [ ] Material ID format adalah UUID
- [ ] Jalankan debug script dan lihat semua output

---

## 🚨 Jika Debug Menunjukkan...

### "Token ada ✅, Authorization header ada, tapi 500"
→ Berarti ada issue dengan backend data (constraint violation, etc)
→ Cek backend logs saat delete

### "Token tidak ada ❌"
→ User tidak login atau token tidak tersimpan
→ Solusi: Login ulang, pastikan token disimpan ke localStorage

### "Authorization header kosong"
→ Frontend code tidak mengirim token
→ Solusi: Update delete function di frontend

### "Material ID bukan UUID"
→ Database mungkin punya ID yang tidak sesuai format
→ Solusi: Perlu data cleanup atau migration

---

## 🔧 Quick Fixes untuk Frontend

### Fix #1: Pastikan Token Dikirim
Cari function `deleteMaterial` atau `handleDelete` di frontend code, pastikan:

```javascript
const deleteMaterial = async (id) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Silakan login terlebih dahulu');
    return;
  }
  
  try {
    const response = await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,  // ← PENTING!
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 200) {
      // Success - refresh list
      location.reload(); // atau refetch materials
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Gagal menghapus materi');
  }
};
```

### Fix #2: Handle Different Status Codes
```javascript
const response = await fetch(...);

if (response.status === 401) {
  alert('Token expired, silakan login ulang');
  // redirect to login
} else if (response.status === 403) {
  alert('Anda tidak memiliki akses untuk delete');
} else if (response.status === 200 || response.status === 204) {
  alert('Material berhasil dihapus');
  location.reload();
} else {
  const error = await response.json();
  alert(`Error: ${error.message}`);
}
```

---

## 📞 Lapor Error dengan Info Lengkap

Setelah debug, berikan info ini:

```
1. Token ada di localStorage: ✅ / ❌
2. Authorization header di-kirim: ✅ / ❌
3. Material ID format: UUID / Integer / Lainnya
4. Response status code: 500 / 401 / 403 / 200 / Lainnya
5. Error message: (copy-paste dari Response tab)
6. Backend server logs: (copy-paste error dari terminal backend)
7. Jalankan ini di console dan lapor hasilnya:
   - localStorage.getItem('token') → [first 50 chars]...
   - JSON dari tab Network → Request/Response body
```

---

## ✅ EXPECTED BEHAVIOR SETELAH FIX

1. User klik delete material
2. Request DELETE dikirim dengan Authorization header
3. Backend menerima, delete material
4. Response 200 dengan message "Materi berhasil dihapus"
5. Frontend refresh list
6. Material hilang dari list
7. **Saat refresh halaman, material TIDAK kembali** ✅

---

## 🎓 Contoh Lengkap Delete Function (React)

```jsx
const deleteMaterial = async (materialId) => {
  if (!window.confirm('Yakin ingin menghapus materi ini?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Token tidak ditemukan, silakan login ulang');
      navigate('/login');
      return;
    }

    const response = await fetch(`/api/materials/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message || 'Material berhasil dihapus');
      // Refresh materials list
      setMaterials(materials.filter(m => m.id !== materialId));
    } else if (response.status === 401) {
      toast.error('Token expired, silakan login ulang');
      navigate('/login');
    } else if (response.status === 403) {
      toast.error('Anda tidak memiliki izin untuk menghapus');
    } else {
      toast.error(data.message || 'Gagal menghapus material');
    }
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Terjadi kesalahan saat menghapus material');
  }
};
```

---

## 📚 File Referensi

| File | Gunakan untuk |
|------|--------------|
| `FRONTEND_DEBUG_CONSOLE.js` | Debug script untuk browser console |
| `testDeletePersistence.js` | Test backend (sudah PASS ✅) |
| `ERROR_500_DEBUG_GUIDE.md` | Debug error backend |
| `FRONTEND_DELETE_FIX.md` | Fix frontend issues |

---

**Sekarang buka browser, buka DevTools, dan jalankan debug script! 🚀**
