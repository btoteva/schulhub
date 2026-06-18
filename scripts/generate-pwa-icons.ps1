# Regenerates the PWA icon set under public/icons/ from the canonical logo.
#
# Run from the project root:
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generate-pwa-icons.ps1
#
# Edit $srcUrl below if the brand logo changes.

$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$srcUrl  = 'https://i.imgur.com/QSWSGYz.png'
$iconDir = Join-Path $projectRoot 'public\icons'
$srcPath = Join-Path $iconDir 'source-logo.png'

if (-not (Test-Path $iconDir)) {
  New-Item -ItemType Directory -Path $iconDir | Out-Null
}

Invoke-WebRequest -UseBasicParsing -Uri $srcUrl -OutFile $srcPath
$src = [System.Drawing.Image]::FromFile($srcPath)
Write-Output ("Source: {0}x{1}" -f $src.Width, $src.Height)

function Save-Resized {
  param([int]$Size, [string]$OutPath, [System.Drawing.Color]$Background, [double]$Scale = 1.0)
  $dst = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.Clear($Background)
  $logoPx = [int]($Size * $Scale)
  $offset = [int](($Size - $logoPx) / 2)
  $g.DrawImage($src, $offset, $offset, $logoPx, $logoPx)
  $g.Dispose()
  $dst.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
  Write-Output ("Saved {0}" -f $OutPath)
}

$transparent = [System.Drawing.Color]::Transparent
# slate-900 for the maskable safe-zone background
$slate900 = [System.Drawing.Color]::FromArgb(255, 15, 23, 42)

# Plain icons (purpose: any) — full-bleed
foreach ($s in @(192, 512, 180)) {
  Save-Resized -Size $s -OutPath (Join-Path $iconDir ("icon-{0}.png" -f $s)) -Background $transparent -Scale 1.0
}

# Maskable icon — 65% safe zone over solid slate-900 background
Save-Resized -Size 512 -OutPath (Join-Path $iconDir 'icon-maskable-512.png') -Background $slate900 -Scale 0.65

# Favicons
foreach ($s in @(32, 16)) {
  Save-Resized -Size $s -OutPath (Join-Path $iconDir ("favicon-{0}.png" -f $s)) -Background $transparent -Scale 1.0
}

$src.Dispose()
Write-Output 'Done.'
