$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path -LiteralPath $envFile -PathType Leaf)) {
    throw "Missing .env file. Copy .env.example to .env and add your local settings."
}

$lineNumber = 0
foreach ($line in Get-Content -LiteralPath $envFile) {
    $lineNumber++
    $trimmedLine = $line.Trim()
    if (-not $trimmedLine -or $trimmedLine.StartsWith("#")) {
        continue
    }

    $separatorIndex = $trimmedLine.IndexOf("=")
    if ($separatorIndex -lt 1) {
        throw "Invalid .env entry on line $lineNumber. Expected KEY=VALUE."
    }

    $name = $trimmedLine.Substring(0, $separatorIndex).Trim()
    $value = $trimmedLine.Substring($separatorIndex + 1).Trim()
    if ($name -notmatch "^[A-Za-z_][A-Za-z0-9_]*$") {
        throw "Invalid environment variable name on .env line $lineNumber."
    }

    if ($value.Length -ge 2) {
        $firstCharacter = $value.Substring(0, 1)
        $lastCharacter = $value.Substring($value.Length - 1, 1)
        if (($firstCharacter -eq '"' -and $lastCharacter -eq '"') -or
            ($firstCharacter -eq "'" -and $lastCharacter -eq "'")) {
            $value = $value.Substring(1, $value.Length - 2)
        }
    }

    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

if ($env:MAIL_USERNAME -match '@gmail\.com$' -and -not [string]::IsNullOrWhiteSpace($env:MAIL_PASSWORD)) {
    $env:MAIL_PASSWORD = $env:MAIL_PASSWORD -replace '\s', ''
    if ($env:MAIL_PASSWORD.Length -ne 16) {
        Write-Warning "MAIL_PASSWORD for Gmail is $($env:MAIL_PASSWORD.Length) characters. Gmail SMTP requires a 16-character Google App Password; update MAIL_PASSWORD in .env."
    }
}

if ([string]::IsNullOrWhiteSpace($env:DB_URL)) {
    throw "DB_URL is missing or empty in .env. Set it to your MySQL JDBC URL."
}
if (-not $env:DB_URL.StartsWith("jdbc:mysql://", [StringComparison]::OrdinalIgnoreCase)) {
    throw "DB_URL in .env must be a MySQL JDBC URL beginning with jdbc:mysql://."
}

# Make the configured URL explicit for Spring Boot, even if the shell has a
# stale SPRING_DATASOURCE_URL override.
$env:SPRING_DATASOURCE_URL = $env:DB_URL

Push-Location $PSScriptRoot
try {
    & .\mvnw.cmd spring-boot:run
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
