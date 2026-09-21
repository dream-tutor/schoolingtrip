# OG 이미지 만들기 — tools\og.html(빌드가 써 준다)을 크롬 헤드리스로 1200x630 캡처해 assets\og-image.png 로 저장.
#   실행:  node build.js  →  powershell -File tools\make-og.ps1  →  node build.js (docs 로 복사)
#   ⚠ 크롬 프로필·출력 경로가 길면(260자 초과) 조용히 실패한다. 그래서 임시 폴더는 짧은 경로를 쓴다.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Split-Path -Parent $here
$tmp = Join-Path $env:TEMP "c2og"
New-Item -ItemType Directory -Force $tmp | Out-Null
$out = Join-Path $tmp "og.png"
if (Test-Path $out) { Remove-Item $out -Force }
$url = "file:///" + ((Join-Path $here "og.html") -replace "\\", "/")
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" }
$p = Start-Process -FilePath $chrome -ArgumentList @("--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run","--no-default-browser-check","--user-data-dir=$tmp\prof","--window-size=1200,630","--virtual-time-budget=5000","--screenshot=$out","`"$url`"") -PassThru
if (-not $p.WaitForExit(60000)) { $p.Kill(); Write-Output "시간 초과"; exit 1 }
if (-not (Test-Path $out)) { Write-Output "캡처 실패"; exit 1 }
Copy-Item $out (Join-Path $site "assets\og-image.png") -Force
Write-Output ("og-image.png " + (Get-Item (Join-Path $site "assets\og-image.png")).Length + " bytes")
