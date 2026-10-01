$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$entries = @()
foreach ($chapter in 1..4) {
    $path = Join-Path $workspace "content/explanations-chapter$chapter.json"
    $chapterEntries = [IO.File]::ReadAllText($path) | ConvertFrom-Json
    foreach ($entry in $chapterEntries) { $entries += $entry }
}
$bankText = [IO.File]::ReadAllText((Join-Path $workspace 'site/questions.js'))
$bank = ($bankText -replace '^window\.QUESTION_BANK = ', '' -replace ';\s*$', '') | ConvertFrom-Json
if ($entries.Count -ne $bank.Count) { throw 'Explanation count does not match question bank' }
$data = [ordered]@{}
foreach ($entry in $entries | Sort-Object id) {
    $id = [string]$entry.id
    if ($data.Contains($id)) { throw "Duplicate explanation ID: $id" }
    if (!$entry.text -or $entry.text.Length -lt 10 -or !$entry.sources) { throw "Missing explanation or source: $id" }
    foreach ($source in $entry.sources) {
        if (!$source.title -or $source.url -notmatch '^https://') { throw "Invalid source format: $id" }
    }
    $data[$id] = $entry
}
foreach ($question in $bank) {
    if (!$data.Contains([string]$question.id)) { throw "Missing explanation for question: $($question.id)" }
}
$json = ConvertTo-Json -InputObject $data -Depth 8
$output = Join-Path $workspace 'site/explanations-data.js'
[IO.File]::WriteAllText($output, "window.QUESTION_EXPLANATIONS = $json;", [Text.UTF8Encoding]::new($false))
Write-Output "Built $($entries.Count) explanations."
