$html = Get-Content -Raw "portfolio-3d.html"

# Extract CSS
if ($html -match '(?sm)<style>(.*?)</style>') {
    [System.IO.File]::WriteAllText("portfolio-3d.css", $matches[1].Trim() + "`n", [System.Text.Encoding]::UTF8)
    $html = [regex]::Replace($html, '(?sm)<style>.*?</style>', '<link rel="stylesheet" href="portfolio-3d.css"/>')
}

# Extract JS
# It uses a non-greedy match starting right after the first line of <script>
if ($html -match '(?sm)<script>\s*`n(.*?)</script>') {
    [System.IO.File]::WriteAllText("portfolio-3d.js", $matches[1].Trim() + "`n", [System.Text.Encoding]::UTF8)
    $html = [regex]::Replace($html, '(?sm)<script>\s*`n.*?</script>', '<script src="portfolio-3d.js"></script>')
}

[System.IO.File]::WriteAllText("portfolio-3d.html", $html, [System.Text.Encoding]::UTF8)
Write-Output "Successfully split the file"
