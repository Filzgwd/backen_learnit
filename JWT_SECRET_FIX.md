# 🔑 JWT_SECRET MISMATCH FIX

## 🎯 Problem Found!

**JWT_SECRET berbeda antara local dan production:**

```
Local (.env):     your_jwt_secret_key
Railway (prod):   4Zx9#tVq2Lm8Pj7RwYc1$Gh5
```

## ❌ Penyebab 401 Error

```
Frontend login ke LOCALHOST
    ↓
Token dibuat dengan: your_jwt_secret_key
    ↓
Frontend kirim DELETE ke PRODUCTION
    ↓
Production verify token dengan: 4Zx9#tVq2Lm8Pj7RwYc1$Gh5
    ↓
JWT_SECRET MISMATCH!
    ↓
❌ 401 Unauthorized
```

## ✅ SOLUTION: Frontend Login ke Production Backend

**Yang harus dilakukan:**

1. **Frontend tidak boleh login ke localhost**
   - Ubah API base URL ke production backend
   - Login ke: `https://backenlearit-production.up.railway.app/api/auth/login`

2. **Token dibuat dengan production JWT_SECRET**
   - Token akan match dengan production verification
   - Delete request akan berhasil ✅

3. **Test flow:**
   - Frontend login ke production
   - Token dibuat dengan `4Zx9#tVq2Lm8Pj7RwYc1$Gh5`
   - Delete material akan work ✅

## 📝 Frontend Changes Needed

### Find in your frontend code:
```javascript
// ❌ WRONG - Points to localhost
const API_URL = 'http://localhost:5000/api';

// ✅ CORRECT - Points to production
const API_URL = 'https://backenlearit-production.up.railway.app/api';
```

### Or use environment variables:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://backenlearit-production.up.railway.app/api';
```

### .env.production:
```
REACT_APP_API_URL=https://backenlearit-production.up.railway.app/api
```

## 🧪 How to Test

1. **Update frontend to use production API**
2. **Build/deploy frontend** to production (Vercel)
3. **Access frontend from production URL**
4. **Login with admin@gmail.com / Admin123**
5. **Try delete material**
6. **Check Network tab - should be 200, not 401**

## 📊 Why This Happens

```
Local Development:
  Frontend (localhost:3000) → Backend (localhost:5000)
  Token valid for both with JWT_SECRET: your_jwt_secret_key

Production:
  Frontend (vercel) → Backend (Railway)
  Token must be created with JWT_SECRET: 4Zx9#tVq2Lm8Pj7RwYc1$Gh5

If Frontend login to localhost but send to Railway production:
  Token created with: your_jwt_secret_key
  Token verified with: 4Zx9#tVq2Lm8Pj7RwYc1$Gh5
  ❌ MISMATCH → 401
```

## ✅ Local .env Fixed

Sudah update `.env` local JWT_SECRET ke `4Zx9#tVq2Lm8Pj7RwYc1$Gh5`

Ini untuk:
- Localhost testing
- Ensuring consistency
- Development yang lebih mudah

## 🔒 Security Note

**JANGAN commit JWT_SECRET ke GitHub!**

Sekarang `.env` sudah ada production secret (for testing only).

Untuk production yang sesungguhnya:
- Keep `.env` private
- Set via Railway environment variables
- Atau use `.env.example` tanpa actual values

## 📋 Checklist

- [ ] Identify current API_URL in frontend
- [ ] Update to production URL if using localhost
- [ ] Rebuild & deploy frontend
- [ ] Test login on production frontend
- [ ] Test delete material
- [ ] Check Network tab - status 200 ✅

---

## Quick Test with Localhost

Jika ingin test dengan localhost:

```bash
# Terminal 1: Start backend (akan use JWT_SECRET dari .env)
npm start

# Terminal 2: Test
node testSetupAndDelete.js
```

Sekarang token akan dibuat dan verify dengan secret yang sama.
