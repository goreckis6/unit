@{
    # PowerShell Script Analyzer settings
    # Exclude specific rules that cause false positives
    ExcludeRules = @()
    IncludeDefaultRules = $true
    
    # Rules configuration
    Rules = @{
        PSAvoidUsingCmdletAliases = @{
            Enabled = $true
        }
    }
}
