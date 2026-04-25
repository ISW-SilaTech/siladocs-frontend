# Azure Backend Deployment Guide

## 🎯 Current Status

- **Backend JAR Built**: ✅ `/tmp/siladocs-backend/target/siladocs-backend.jar` (85MB)
- **Latest Commit**: `dd1ce41` - Fix duplicate /api prefix in AccessCodeController and DocumentController
- **Changes Pushed to GitHub**: ✅ https://github.com/ISW-SilaTech/siladocs-backend

## 📋 Pre-Deployment Checklist

- ✅ Backend code fixed (AccessCodeController, DocumentController)
- ✅ Code committed to GitHub
- ✅ Maven build successful
- ⏳ **PENDING**: Deploy JAR to Azure App Service

## 🚀 Deployment Options

### **Option 1: Azure Portal UI (Recommended for first-time)**

1. **Go to Azure Portal**
   - URL: https://portal.azure.com
   - Sign in with your Azure account

2. **Navigate to App Service**
   - Search for: "siladocs-backend-ejfkddf7fkgucrh6"
   - Or find it under Resource Groups

3. **Deploy the Application**
   - Click: **Deployment Center** (in left menu)
   - Click: **Settings**
   - Choose deployment source:
     - **GitHub** (Recommended): Automatic deploys on push
     - **Local Git**: Deploy from git push
     - **FTP**: Manual file upload

4. **If using GitHub:**
   - Connect your GitHub account
   - Select repository: `ISW-SilaTech/siladocs-backend`
   - Select branch: `main`
   - Build provider: **GitHub Actions**
   - Click: **Save**

5. **Monitor Deployment**
   - Go to: **Deployment Center** → **Logs**
   - Watch build progress (5-10 minutes)
   - Verify completion status

---

### **Option 2: Azure CLI (If installed)**

```bash
# 1. Login to Azure
az login

# 2. Deploy using GitHub
az webapp deployment github-actions add \
  --repo ISW-SilaTech/siladocs-backend \
  --branch main \
  --resource-group <your-resource-group> \
  --name siladocs-backend-ejfkddf7fkgucrh6

# 3. Or deploy JAR directly
az webapp up \
  --resource-group <your-resource-group> \
  --name siladocs-backend-ejfkddf7fkgucrh6 \
  --location westus3 \
  --sku B1
```

---

### **Option 3: FTP Upload (Manual)**

1. **Get FTP Credentials**
   - Azure Portal → App Service → Deployment Center → FTP
   - Copy: FTP hostname, username, password

2. **Upload JAR File**
   ```bash
   # Using ftp command or FileZilla
   # Upload to: /site/wwwroot/siladocs-backend.jar
   ftp <ftp-host>
   put /tmp/siladocs-backend/target/siladocs-backend.jar
   ```

3. **Restart App Service**
   - Azure Portal → Overview → Restart

---

### **Option 4: Git Push to Azure (If configured)**

```bash
# 1. Add Azure remote
cd /tmp/siladocs-backend
git remote add azure <azure-git-url>

# 2. Deploy
git push azure main

# 3. Monitor logs
az webapp log tail --name siladocs-backend-ejfkddf7fkgucrh6
```

---

## ✅ Post-Deployment Verification

### **1. Check Application is Running**

```bash
# Test health endpoint
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/actuator/health

# Expected response:
# {"status":"UP"}
```

### **2. Verify Controller Mappings**

The fixed controllers should now respond at:

```bash
# Test 1: Access Codes (FIXED)
curl -X POST https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/access-codes/generate \
  -H "Content-Type: application/json" \
  -d '{"code":"test","expiresAt":"2026-12-31T23:59:59Z","institutionName":"Test"}'

# Test 2: Documents (FIXED)
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/documents

# Test 3: Careers (Already Fixed)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/careers
```

### **3. Test Full Authentication Flow**

```bash
# Step 1: Validate access code
curl "https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/auth/validate-code?code=YOUR_CODE"

# Step 2: Register
curl -X POST https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "accessCode":"YOUR_CODE",
    "fullName":"Test User",
    "email":"test@example.com",
    "password":"password123"
  }'

# Step 3: Login
curl -X POST https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'

# Expected response should include: accessToken, user object, institution object
```

---

## 🔍 Troubleshooting

### **Issue: Application not responding (502 Bad Gateway)**

**Possible Causes:**
1. Application failed to start
2. Wrong port configured
3. Database connection issues

**Solutions:**
```bash
# Check logs
az webapp log tail --name siladocs-backend-ejfkddf7fkgucrh6 --resource-group <group>

# Restart app
az webapp restart --name siladocs-backend-ejfkddf7fkgucrh6 --resource-group <group>

# Check application.yml settings
# Verify: server.port (should match Azure's expected port)
```

### **Issue: 404 Not Found on endpoints**

**Possible Causes:**
1. Context-path not correctly set
2. Controllers still have /api prefix

**Solution:**
```bash
# Verify in application.yml
cat src/main/resources/application.yml | grep -A 2 "server:"
# Should show: servlet.context-path: /api
```

### **Issue: CORS errors from frontend**

**Solution:**
- Verify SecurityConfig.java has CORS filter enabled
- Check Azure CORS settings in App Service
- Verify origin header: `https://siladocs-frontend.vercel.app`

### **Issue: Database connection errors**

**Check:**
```bash
# Verify database URL in application.yml
# Should be Azure PostgreSQL or similar
# Check connection string in App Service settings

# Verify in App Service → Configuration → Connection strings
```

---

## 📊 Deployment Timeline

| Step | Duration | Status |
|------|----------|--------|
| Build JAR | ✅ Complete | 2 minutes |
| Commit to GitHub | ✅ Complete | 1 minute |
| Deploy to Azure | ⏳ Pending | 5-10 minutes |
| Health Check | ⏳ Pending | 1 minute |
| Verify Endpoints | ⏳ Pending | 5 minutes |

---

## 🔐 Security Notes

- JWT secret must match between backend and frontend
- Vercel domain must be in CORS whitelist
- Connection strings should be stored in App Service Configuration (not in git)
- Never commit `.env` files with secrets

---

## 📚 Reference Documentation

- **Azure App Service**: https://docs.microsoft.com/azure/app-service/
- **Spring Boot on Azure**: https://learn.microsoft.com/azure/developer/java/spring-framework/
- **GitHub Actions with Azure**: https://docs.microsoft.com/azure/developer/github/github-actions
- **Azure CLI Reference**: https://docs.microsoft.com/cli/azure/

---

## ✨ Next Steps After Deployment

1. ✅ Verify backend is running
2. ✅ Test all endpoints with proper authentication
3. ✅ Verify CORS headers in responses
4. ✅ Test frontend-backend integration
5. ✅ Monitor logs for errors

**Estimated Deployment Time**: 15-20 minutes total

Last Updated: 2026-04-25
Backend Version: `dd1ce41` (AccessCodeController & DocumentController fixes)
