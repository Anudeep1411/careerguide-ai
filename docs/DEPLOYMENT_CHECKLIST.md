# CareerGuide AI — Final Deployment Checklist

## 1. Commit stable branch

```powershell
cd C:\Users\Admin\Desktop\CareerGuide-AI
git status
git add .
git commit -m "Final polish before deployment"
git push origin professional-stable
```

## 2. Merge to main when local test is perfect

```powershell
git checkout main
git pull origin main
git merge professional-stable
git push origin main
```

## 3. Render backend environment

Required:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_strong_jwt_secret
ADMIN_SECRET=careerguide_admin_2026
OTP_EXPIRES_MINUTES=1440
```

Build command:

```txt
npm install
```

Start command:

```txt
npm start
```

Health check:

```txt
https://careerguide-ai-7s24.onrender.com/api/health
```

## 4. Vercel frontend environment

```env
VITE_API_URL=https://careerguide-ai-7s24.onrender.com/api
```

Redeploy latest production deployment.

## 5. Final production test

- Open https://careerguide-ai-one.vercel.app/
- Signup/login.
- Resume save/edit/download.
- Analyzer.
- Job Match manual and PDF.
- Company Directory.
- Interview.
- History.
