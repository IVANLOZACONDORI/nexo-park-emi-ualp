$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$backendRoot = Join-Path $projectRoot 'backend'
$envPath = Join-Path $backendRoot '.env'
if (!(Test-Path $envPath)) { throw 'Falta backend\.env. Configure su conexion PostgreSQL usando backend\.env.example como plantilla.' }
$portValue = '4000'
$portLine = Get-Content $envPath | Where-Object { $_ -match '^\s*PORT\s*=' } | Select-Object -Last 1
if ($portLine) { $portValue = (($portLine -split '=',2)[1] -split '#',2)[0].Trim().Trim('"').Trim("'") }
if ($env:PORT) { $portValue = $env:PORT }
if ($portValue -notmatch '^\d+$') { throw 'PORT debe ser un numero de puerto valido.' }
$baseUrl = "http://localhost:$portValue"
$existing = $null
try { $existing = Invoke-RestMethod "$baseUrl/api/health" -TimeoutSec 3 } catch {}
if ($existing) {
 if ($existing.version -ne '35.0.0') { throw "Hay otra version iniciada en $baseUrl. Detenga su terminal con Ctrl+C (o su contenedor Docker) y vuelva a ejecutar este archivo." }
} else {
 $nodeProcess = Start-Process -FilePath 'node' -ArgumentList 'src/server.js' -WorkingDirectory $backendRoot -PassThru
 $ready = $false
 for ($attempt=0; $attempt -lt 45; $attempt++) {
  Start-Sleep -Seconds 1
  if ($nodeProcess.HasExited) { throw 'El servidor no pudo iniciar. Revise el error de PostgreSQL/configuracion en la terminal.' }
  try { $status = Invoke-RestMethod "$baseUrl/api/health" -TimeoutSec 2; if ($status.version -eq '35.0.0') { $ready=$true; break } } catch {}
 }
 if (!$ready) { throw 'El servidor sigue sin responder. Revise la terminal; no abra la pagina con Live Server.' }
}
$loginPage=Invoke-WebRequest "$baseUrl/login" -UseBasicParsing -TimeoutSec 5
if (!$loginPage.Content.Contains('name="nexo-build" content="35.0.0"')) { throw 'El backend esta sirviendo un frontend antiguo. Revise FRONTEND_DIR en backend/.env y copie todo el frontend V35.' }
$challenge=Invoke-RestMethod "$baseUrl/api/autenticacion/captcha" -TimeoutSec 5
if (!$challenge.token -or !$challenge.question) { throw 'El servidor no devuelve un CAPTCHA valido.' }
Write-Host 'Servidor V35 y CAPTCHA comprobados. Abriendo inicio institucional EMI.'
Start-Process "$baseUrl/"
