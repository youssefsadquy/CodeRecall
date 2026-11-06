#Requires -Version 5.1
<#
.SYNOPSIS
  Publish CodeRecall as a self-contained, single-file Windows executable.

.EXAMPLE
  .\scripts\build.ps1
  .\scripts\build.ps1 -Runtime win-arm64 -Output publish-arm64
#>
[CmdletBinding()]
param(
  [ValidateSet('Debug', 'Release')]
  [string]$Configuration = 'Release',
  [string]$Runtime = 'win-x64',
  [string]$Output = 'publish'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

try {
  Write-Host "Publishing CodeRecall ($Configuration / $Runtime)..." -ForegroundColor Cyan

  dotnet publish CodeRecall.csproj `
    -c $Configuration `
    -r $Runtime `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -p:EnableCompressionInSingleFile=true `
    -o $Output

  if ($LASTEXITCODE -ne 0) {
    throw "dotnet publish failed with exit code $LASTEXITCODE"
  }

  # WebView2 ships XML documentation next to the app; keep the release folder clean.
  Get-ChildItem -Path $Output -Filter '*.xml' -File -ErrorAction SilentlyContinue |
    Remove-Item -Force

  $exe = Join-Path $Output 'CodeRecall.exe'
  if (-not (Test-Path $exe)) {
    throw "Expected build output was not created: $exe"
  }

  $size = [math]::Round((Get-Item $exe).Length / 1MB, 1)
  Write-Host "Built $exe ($size MB)" -ForegroundColor Green
}
finally {
  Pop-Location
}
