# PowerShell script to update Day 1 content in lesson files

# Read the reference translations
$refFile = "c:\Users\User\Documents\GitHub\educly\public\i18n\lessonContent\day1-translations-new.md"
$refContent = Get-Content $refFile -Raw

Write-Host "Reference file loaded. Starting replacements..."

# English file
Write-Host "`nProcessing English (en-lessons.json)..."
$enFile = "c:\Users\User\Documents\GitHub\educly\public\i18n\lessonContent\en-lessons.json"
$enContent = Get-Content $enFile -Raw

# Find and replace day1 section (from opening { to before day2)
# This is a manual step - open the files and replace line 1-160 with content from day1-translations-new.md

Write-Host " - File: $enFile"
Write-Host " - Action: Replace lines 1-160 with English translation from reference"

# Spanish file
Write-Host "`nProcessing Spanish (es-lessons.json)..."
$esFile = "c:\Users\User\Documents\GitHub\educly\public\i18n\lessonContent\es-lessons.json"
Write-Host " - File: $esFile"
Write-Host " - Action: Replace lines 1-160 with Spanish translation from reference"

# French file  
Write-Host "`nProcessing French (fr-lessons.json)..."
$frFile = "c:\Users\User\Documents\GitHub\educly\public\i18n\lessonContent\fr-lessons.json"
Write-Host " - File: $frFile"
Write-Host " - Action: Replace lines 1-160 with French translation from reference"

Write-Host "`n=== INSTRUCTIONS ==="
Write-Host "1. Open $refFile to see the new translations"
Write-Host "2. For each language file (EN, ES, FR):"
Write-Host "   - Open the file in your editor"
Write-Host "   - Select from line 1 to line 160 (stop before 'day2')"  
Write-Host "   - Replace with the corresponding translation from the reference file"
Write-Host "   - Save and verify JSON is valid"
Write-Host "`nThe translations are ready in: $refFile"
