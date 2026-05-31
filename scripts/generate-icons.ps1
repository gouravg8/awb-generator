$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$iconsDir = Join-Path $root "icons"
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

function Add-RoundedRect {
  param(
    [System.Drawing.Drawing2D.GraphicsPath]$Path,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $diameter = $Radius * 2
  $Path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $Path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $Path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $Path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $Path.CloseFigure()
}

function New-AwbIcon {
  param([int]$Size)

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRect -Path $bgPath -X 0 -Y 0 -Width $Size -Height $Size -Radius ($Size * 0.22)

  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle 0, 0, $Size, $Size),
    [System.Drawing.Color]::FromArgb(255, 35, 34, 31),
    [System.Drawing.Color]::FromArgb(255, 16, 16, 18),
    45
  )
  $graphics.FillPath($bgBrush, $bgPath)

  $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 232, 162, 39))
  $paperBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 240, 237, 232))
  $darkPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 24, 24, 26)), ([Math]::Max(1, $Size * 0.035))
  $accentPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 232, 162, 39)), ([Math]::Max(1, $Size * 0.045))
  $lightPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 240, 237, 232)), ([Math]::Max(1, $Size * 0.035))

  $boxX = $Size * 0.18
  $boxY = $Size * 0.18
  $boxW = $Size * 0.64
  $boxH = $Size * 0.48
  $boxPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRect -Path $boxPath -X $boxX -Y $boxY -Width $boxW -Height $boxH -Radius ($Size * 0.08)
  $graphics.FillPath($paperBrush, $boxPath)
  $graphics.DrawPath($darkPen, $boxPath)

  $graphics.DrawLine($accentPen, ($Size * 0.25), ($Size * 0.33), ($Size * 0.75), ($Size * 0.33))
  $graphics.DrawLine($lightPen, ($Size * 0.29), ($Size * 0.47), ($Size * 0.58), ($Size * 0.47))

  $fontSize = [Math]::Max(7, $Size * 0.19)
  $font = New-Object System.Drawing.Font "Arial", $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = New-Object System.Drawing.RectangleF 0, ($Size * 0.66), $Size, ($Size * 0.25)
  $graphics.DrawString("AWB", $font, $accentBrush, $textRect, $format)

  $outPath = Join-Path $iconsDir "icon-$Size.png"
  $bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $bitmap.Dispose()
  $bgPath.Dispose()
  $boxPath.Dispose()
  $bgBrush.Dispose()
  $accentBrush.Dispose()
  $paperBrush.Dispose()
  $darkPen.Dispose()
  $accentPen.Dispose()
  $lightPen.Dispose()
  $font.Dispose()
  $format.Dispose()
}

16, 32, 48, 128 | ForEach-Object { New-AwbIcon -Size $_ }
