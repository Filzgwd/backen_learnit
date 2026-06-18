# 🚨 Error 500 pada Delete Material - Debugging Guide

## Status
Backend mengembalikan **error 500** ketika user mencoba delete material.

Screenshot menunjukkan: `"Gagal menghapus: 500"`

## Penyebab Error 500

Error 500 = Internal Server Error. Kemungkinan penyebab:

### 1. **Database Connection Error** 
- Koneksi ke database terputus
- Pool timeout
- Network issue ke Neon database

### 2. **Foreign Key Constraint Violation**
- Ada data lain yang masih referensi material ini
- Seharusnya CASCADE, tapi mungkin ada constraint tanpa CASCADE

### 3. **Invalid UUID Format**
- Material ID tidak valid format UUID
- Tapi ini jarang terjadi kalau dari frontend

### 4. **Database Query Error**
- Syntax error
- Type mismatch
- Missing column

## Cara Debug

### Step 1: Cek Server Logs
**PENTING**: Pastikan backend server SEDANG BERJALAN ketika user mencoba delete.

```bash
# Terminal 1
npm start
```

Saat user mencoba delete, lihat log di terminal:

```
[DELETE_MATERIAL] Request: { materialId: '...', userId: '...', timestamp: '...' }
[DELETE_MATERIAL] Error: { error: 'message', code: 'code', materialId: '...', stack: '...' }
```

**Catat error message yang muncul!**

### Step 2: Check Database Constraints
Jalankan script untuk verify database schema:

```bash
node checkDatabaseSchema.js
node checkQuizzesColumn.js
```

**Harus menunjukkan:**
```
✅ Good: quizzes table does NOT have material_id column
```

### Step 3: Verify Material Dapat Dihapus
Jalankan test script:

```bash
node testDeletePersistence.js
```

**Harus menunjukkan:**
```
✅ ALL TESTS PASSED - DELETE IS WORKING CORRECTLY
```

Jika test ini PASS, tapi user masih dapat error 500, maka masalahnya adalah:
- Specific material dengan relasi data yang tidak bisa dihapus
- Bukan general delete issue

## Solusi Spesifik berdasarkan Error Message

### ❌ Error: "Materi tidak bisa dihapus karena masih digunakan..."
**Penyebab**: Ada quiz, content, atau progress yang masih referensi material

**Solusi**: 
```sql
-- Check data yang referensi material
SELECT * FROM material_contents WHERE material_id = 'MATERIAL_ID';
SELECT * FROM user_progress WHERE material_id = 'MATERIAL_ID';
SELECT * FROM quizzes WHERE material_id = 'MATERIAL_ID'; -- jika column masih ada

-- Delete referencing data dulu
DELETE FROM material_contents WHERE material_id = 'MATERIAL_ID';
DELETE FROM user_progress WHERE material_id = 'MATERIAL_ID';

-- Baru delete material
DELETE FROM materials WHERE id = 'MATERIAL_ID';
```

### ❌ Error: "connection timeout"
**Penyebab**: Database connection slow atau timeout

**Solusi**:
1. Pastikan DATABASE_URL di .env sudah benar
2. Check Neon dashboard apakah database online
3. Restart backend server: `npm start`
4. Coba delete lagi

### ❌ Error: "violates foreign key constraint"
**Penyebab**: Ada constraint tanpa CASCADE

**Solusi**: 
1. Check constraint configuration
2. Update constraint dengan ON DELETE CASCADE
3. Run migration untuk update existing data

## Testing Manual

### Test di Backend (Sudah Terintegrasi)
```bash
npm start  # Terminal 1

node testDeletePersistence.js  # Terminal 2
```

Expected:
```
✅ ALL TESTS PASSED
✓ Material was deleted from database
✓ Material cannot be fetched by ID
✓ Material not in materials list
```

### Jika Ada Material Spesifik Tidak Bisa Dihapus
1. Catat material ID dari error
2. Run query di database:
```sql
-- Check material
SELECT * FROM materials WHERE id = 'MATERIAL_ID';

-- Check relasi
SELECT * FROM material_contents WHERE material_id = 'MATERIAL_ID';
SELECT * FROM user_progress WHERE material_id = 'MATERIAL_ID';
SELECT * FROM quizzes WHERE material_id = 'MATERIAL_ID';
```

## Improvement yang Sudah Dilakukan

✅ **Error Handling**
- Tangkap constraint violation (code 23503)
- Log detail error untuk debugging
- Return meaningful error message

✅ **Database Schema Check**
- Verify ON DELETE CASCADE di constraints
- Verify quizzes tidak punya material_id
- Check material columns

✅ **Logging**
- Log setiap delete request
- Log error dengan detail (code, message, stack)
- Log user yang melakukan delete

## File untuk Debugging

| File | Fungsi |
|------|--------|
| `debugDeleteError.js` | Test delete dan lihat error detail |
| `checkDatabaseSchema.js` | Verify schema & constraints |
| `checkQuizzesColumn.js` | Check quizzes table |
| `testDeletePersistence.js` | Test delete secara lengkap |

## Production Troubleshooting

Jika error terjadi di production (Railway):

1. **Check Railway Logs**
   - Dashboard Railway → Service → Logs
   - Cari `[DELETE_MATERIAL]`

2. **Check Railway Database**
   - Railway → Data → PostgreSQL
   - Connect via psql atau admin panel
   - Run query untuk check constraints

3. **Common Issues di Production**
   - Database connection pool exhausted
   - SSL/TLS error
   - Network timeout

## Checklist Fix

- [ ] Run `npm start` di backend
- [ ] Jalankan `checkDatabaseSchema.js` untuk verify schema
- [ ] Jalankan `testDeletePersistence.js` untuk verify delete works
- [ ] Cek server logs saat user delete - catat error message
- [ ] Jika ada specific material tidak bisa dihapus, check relasi data
- [ ] Update frontend untuk handle error response lebih baik
- [ ] Deploy ke production setelah verify di local

---

**⚠️ PENTING**: Jika masih error 500:
1. **Copy-paste error message LENGKAP** dari server logs
2. **Catat material ID** yang tidak bisa dihapus
3. **Check apakah test script bisa delete** (untuk verify general issue vs specific issue)
