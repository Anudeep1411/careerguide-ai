# CareerGuide AI - Pack 3A

## Includes

- Job Match page professional upgrade
- Saved resume selection
- Resume text manual paste
- Resume PDF upload
- Job notification PDF upload
- Detailed report output
- Match score
- Shortlist chance
- Matched skills
- Missing skills
- Required keywords
- Resume improvements
- Expected interview questions
- 30-day roadmap
- Job match history
- Target role default fallback fix script

## Apply

Copy these folders into project root and replace files:

- server
- src
- docs

Then run:

```powershell
cd C:\Users\Admin\Desktop\CareerGuide-AI
.\docs\apply_target_role_fix.ps1
```

## Localhost test

Backend:

```powershell
cd C:\Users\Admin\Desktop\CareerGuide-AI\server
npm run dev
```

Frontend:

```powershell
cd C:\Users\Admin\Desktop\CareerGuide-AI
npm run dev
```

Open:

```txt
http://localhost:5173/
```

## Test order

1. Login
2. Open Job Match
3. Select saved resume OR paste resume text
4. Paste job description OR upload job notification PDF
5. Generate Match Report
6. Check history card

## If PDF route fails

Install dependencies in server folder:

```powershell
cd C:\Users\Admin\Desktop\CareerGuide-AI\server
npm install multer pdf-parse
```
