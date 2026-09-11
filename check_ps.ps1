$errors = $null
$tokens = $null
[void][System.Management.Automation.Language.Parser]::ParseFile("test_bulk_graduation_injection.ps1", [ref]$tokens, [ref]$errors)
$errors | Format-List Message, ErrorId, Extent
