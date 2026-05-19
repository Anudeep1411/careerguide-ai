# CareerGuide AI - Admin Commands Localhost
# Make sure backend is running: cd server; npm run dev

$adminSecret = "careerguide_admin_2026"
$baseUrl = "http://localhost:5000/api"
$headers = @{ "x-admin-secret" = $adminSecret }

# 1) View reset/contact-admin requests
$data = Invoke-RestMethod -Uri "$baseUrl/auth/admin/reset-requests" -Headers $headers
$data.requests | Select-Object email,status,requestedAt,temporaryPasswordSetAt | Format-Table

# 2) Set generated temporary password by user email
$email = "user@example.com"
$body = @{ email = $email } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/admin/set-temp-password" -Method POST -ContentType "application/json" -Headers $headers -Body $body

# 3) Set your own temporary password by user email
$email = "user@example.com"
$tempPassword = "123456"
$body = @{ email = $email; temporaryPassword = $tempPassword } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/admin/set-temp-password" -Method POST -ContentType "application/json" -Headers $headers -Body $body
