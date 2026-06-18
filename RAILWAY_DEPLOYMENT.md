# 🚂 Railway Deployment Setup & Troubleshooting

## ❌ Problem
Production URL return 404: `https://backenlearit-production.up.railway.app/api`

## 🔍 Diagnosis

Output dari script test:
```
Status: 404
Message: Application not found
```

**Ini berarti:**
- Backend bukan running di production
- Atau URL sudah berubah
- Atau project di-delete

## ✅ Solution: Setup/Re-deploy di Railway

### Step 1: Check Railway Dashboard
1. Login ke https://railway.app
2. Lihat project "backenlearit-production" atau sejenisnya
3. **Status apa?**
   - ❌ Deployment failed → Lihat logs
   - ⏸️ Stopped → Start ulang
   - ✅ Active → Check why 404

### Step 2: Jika Deployment Failed

**Di Railway Dashboard:**
1. Project → Deployments tab
2. Klik deployment terakhir
3. Lihat **Build Logs** untuk error
4. Common errors:
   - Missing environment variable
   - Port not exposed
   - Module not found

### Step 3: Check Environment Variables

**Di Railway:**
1. Project → Variables tab
2. Pastikan ada:
   ```
   JWT_SECRET=your_jwt_secret_key
   DATABASE_URL=postgresql://...neon.tech...
   NODE_ENV=production
   PORT=8080 (atau automatic)
   ```

### Step 4: Check PORT Configuration

Railway biasanya auto-assign PORT environment variable.

**Verify src/server.js:**
```javascript
const PORT = process.env.PORT || 5001; // Railway akan set PORT
```

✅ Ini sudah benar di kode

### Step 5: Force Redeploy

Jika masih 404:
1. Railway dashboard
2. Project settings
3. Redeploy latest commit
4. Atau: Delete deployment → Redeploy

### Step 6: Check Deployment URL

Setelah redeploy:
1. Railway dashboard
2. Deployments tab
3. Latest deployment status
4. URL harus ada (biasanya auto-generated)

## 🧪 Test Setelah Deploy

```bash
# Cek apakah URL baru
# Ganti URL di testProduction.js
node testProduction.js
```

## 📋 Railway Deployment Checklist

- [ ] Project ada di Railway
- [ ] Repository connected ke GitHub
- [ ] Main branch selected
- [ ] Environment variables set (JWT_SECRET, DATABASE_URL)
- [ ] Deployment status = Success
- [ ] URL accessible (bukan 404)
- [ ] Test endpoint return data (bukan 404)

## 🆘 If Still 404

### Option 1: Redeploy Everything
```bash
# Di Railway dashboard:
# 1. Stop all deployments
# 2. Delete service
# 3. Create new service from GitHub repo
# 4. Set environment variables
# 5. Deploy
```

### Option 2: Check Logs
```
Railway Dashboard → Deployments → Logs (Stdout/Stderr)
```

Lihat apa error ada saat startup.

### Option 3: Check Port Binding
URL 404 bisa juga berarti:
- Port tidak di-expose dengan benar
- Server crash setelah deployment

## 📝 How Railway Auto-Deploy Works

1. Kita push ke GitHub
2. Railway webhook trigger
3. Railway pull latest code
4. Build dan run `npm start`
5. Server should listen on `process.env.PORT`
6. Railway generate public URL

## 🔑 Important for Railway

**src/server.js must use PORT from env:**
```javascript
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

✅ Ini sudah benar!

## 💡 Next Steps

1. Cek Railway dashboard status
2. Jika deployment failed → Fix error dari logs
3. Jika port issue → Check PORT environment variable
4. Jika URL 404 → Redeploy dari GitHub

**Yang penting: Pastikan environment variable JWT_SECRET ada!**

Tanpa JWT_SECRET yang benar, token tidak bisa di-verify → 401 error
