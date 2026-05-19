# Admin Temporary Password Commands

## Localhost

```powershell
$headers = @{ "x-admin-secret" = "careerguide_admin_2026" }

$data = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin/reset-requests" -Headers $headers
$data.requests | Select-Object email,status,requestedAt | Format-Table
```

Set temporary password:

```powershell
$headers = @{ "x-admin-secret" = "careerguide_admin_2026" }
$body = @{ email = "user@example.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin/set-temp-password" -Method POST -ContentType "application/json" -Headers $headers -Body $body
```

## Live Render

```powershell
$headers = @{ "x-admin-secret" = "careerguide_admin_2026" }

$data = Invoke-RestMethod -Uri "https://careerguide-ai-7s24.onrender.com/api/auth/admin/reset-requests" -Headers $headers
$data.requests | Select-Object email,status,requestedAt | Format-Table
```

Set temporary password:

```powershell
$headers = @{ "x-admin-secret" = "careerguide_admin_2026" }
$body = @{ email = "user@example.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://careerguide-ai-7s24.onrender.com/api/auth/admin/set-temp-password" -Method POST -ContentType "application/json" -Headers $headers -Body $body
```
