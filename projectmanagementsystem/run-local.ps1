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

Push-Location $PSScriptRoot
try {
    & .\mvnw.cmd spring-boot:run
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
