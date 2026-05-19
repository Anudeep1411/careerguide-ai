# Run this from the project root: C:\Users\Admin\Desktop\CareerGuide-AI
# It removes the default "Frontend Developer" fallback for new Resume Builder records.

$resumeBuilderPath = "src/pages/ResumeBuilder.jsx"

if (!(Test-Path $resumeBuilderPath)) {
  Write-Host "ResumeBuilder.jsx not found. Run this script from project root." -ForegroundColor Red
  exit 1
}

$content = Get-Content $resumeBuilderPath -Raw

$content = $content.Replace('targetRole: loggedUser?.targetRole || "Frontend Developer",', 'targetRole: loggedUser?.targetRole || "",')
$content = $content.Replace('localStorage.setItem("cg_analyzer_target_role", resume.careerDetails.targetRole || "Frontend Developer");', 'localStorage.setItem("cg_analyzer_target_role", resume.careerDetails.targetRole || "");')
$content = $content.Replace('payload.title = payload.title || `${payload.careerDetails.targetRole || "CareerGuide"} Resume`;', 'payload.title = payload.title || `${payload.careerDetails.targetRole || "CareerGuide"} Resume`;')

Set-Content -Path $resumeBuilderPath -Value $content

Write-Host "Target role default fallback fix applied." -ForegroundColor Green
