#Requires -Version 5.1
<#
.SYNOPSIS
  Generates assets/social-preview.png (1280x640) for the GitHub repository.
#>
[CmdletBinding()]
param(
  [string]$Output = ''
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Output) { $Output = Join-Path (Split-Path -Parent $scriptDir) 'assets\social-preview.png' }

Add-Type -AssemblyName System.Drawing

$W = 1280
$H = 640
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-Brush([string]$hex, [int]$alpha = 255) {
  $c = [System.Drawing.ColorTranslator]::FromHtml($hex)
  return New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
}

function Draw-Card([float]$x, [float]$y, [float]$w, [float]$h, [float]$angle, [string]$accent, [string]$tag, [string]$title, [string]$sub) {
  $state = $g.Save()
  $g.TranslateTransform($x + $w / 2, $y + $h / 2)
  $g.RotateTransform($angle)
  $g.TranslateTransform(-($x + $w / 2), -($y + $h / 2))

  $shadow = New-RoundedPath ($x + 10) ($y + 14) $w $h 22
  $g.FillPath((New-Brush '#000000' 90), $shadow)
  $shadow.Dispose()

  $panel = New-RoundedPath $x $y $w $h 22
  $g.FillPath((New-Brush '#151d2e' 252), $panel)
  $g.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($accent), 1.4)), $panel)

  $pill = New-RoundedPath ($x + 18) ($y + 18) 52 26 13
  $g.FillPath((New-Brush $accent 38), $pill)
  $g.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($accent), 1)), $pill)

  $tagFont = New-Object System.Drawing.Font('Segoe UI Semibold', 11, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $tagBrush = New-Brush $accent
  $g.DrawString($tag, $tagFont, $tagBrush, ($x + 24), ($y + 22))

  $titleFont = New-Object System.Drawing.Font('Segoe UI Semibold', 21, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString($title, $titleFont, (New-Brush '#e9edf6'), ($x + 18), ($y + 58))

  $subFont = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString($sub, $subFont, (New-Brush '#68748c'), ($x + 18), ($y + 96))

  $g.Restore($state)
  $panel.Dispose(); $pill.Dispose()
  $tagFont.Dispose(); $tagBrush.Dispose(); $titleFont.Dispose(); $subFont.Dispose()
}

# Background
$bgRect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $bgRect, ([System.Drawing.Color]::FromArgb(11, 14, 20)), ([System.Drawing.Color]::FromArgb(21, 29, 46)), 28
$g.FillRectangle($bg, $bgRect)

# Soft glows
$g.FillEllipse((New-Brush '#7cf2c0' 22), 720, -240, 760, 760)
$g.FillEllipse((New-Brush '#8f9dff' 18), -260, 290, 700, 700)
$g.FillEllipse((New-Brush '#7cf2c0' 10), 40, -180, 520, 520)

# Faint dot grid
for ($x = 40; $x -lt $W; $x += 32) {
  for ($y = 40; $y -lt $H; $y += 32) {
    $g.FillEllipse((New-Brush '#ffffff' 8), $x, $y, 2, 2)
  }
}

# Logo tile
$logo = New-RoundedPath 80 68 92 92 24
$g.FillPath((New-Brush '#121a29'), $logo)
$g.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#7cf2c0'), 2)), $logo)
$logoFont = New-Object System.Drawing.Font('Cascadia Mono', 30, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString('</>', $logoFont, (New-Brush '#7cf2c0'), (New-Object System.Drawing.RectangleF 80, 68, 92, 92), $sf)

# Headline
$titleFont = New-Object System.Drawing.Font('Segoe UI Semibold', 62, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('CodeRecall', $titleFont, (New-Brush '#e9edf6'), 196, 62)

$taglineFont = New-Object System.Drawing.Font('Segoe UI Semibold', 25, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Relearn faster. Remember longer.', $taglineFont, (New-Brush '#7cf2c0'), 200, 142)

$descFont = New-Object System.Drawing.Font('Segoe UI', 20, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Offline-first spaced repetition for software engineers', $descFont, (New-Brush '#97a3ba'), 82, 236)
$g.DrawString('returning to code.', $descFont, (New-Brush '#97a3ba'), 82, 270)

# Chips
$chips = @(
  @{ text = 'Windows 10/11'; color = '#6cc7ff' },
  @{ text = 'No account'; color = '#7cf2c0' },
  @{ text = 'No telemetry'; color = '#7cf2c0' },
  @{ text = 'MIT'; color = '#ffc46b' }
)
$chipFont = New-Object System.Drawing.Font('Segoe UI Semibold', 13, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$cx = 82
foreach ($chip in $chips) {
  $size = $g.MeasureString($chip.text, $chipFont)
  $cw = [math]::Ceiling($size.Width) + 28
  $path = New-RoundedPath $cx 330 $cw 34 17
  $g.FillPath((New-Brush $chip.color 24), $path)
  $g.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($chip.color), 1)), $path)
  $g.DrawString($chip.text, $chipFont, (New-Brush $chip.color), ($cx + 14), 338)
  $path.Dispose()
  $cx += $cw + 10
}

# Footer metric
$metaFont = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('214 cards  |  8 areas  |  C# + vanilla JavaScript  |  single-file exe', $metaFont, (New-Brush '#68748c'), 82, 520)

# Flashcard stack
Draw-Card 812 80 300 155 -7 '#f2d06b' 'JS' 'The event loop' 'microtasks run before timers'
Draw-Card 880 235 300 155 5 '#8f9dff' 'DSA' 'Binary search' 'O(log n)  |  sorted input'
Draw-Card 800 395 300 155 -3 '#7cf2c0' 'CS' 'Virtual memory' 'pages  |  TLB  |  page faults'

# Bottom accent line
$g.FillRectangle((New-Brush '#7cf2c0' 190), 0, $H - 5, $W, 5)

$dir = Split-Path -Parent $Output
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
$bmp.Save($Output, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Host "Wrote $Output" -ForegroundColor Green

