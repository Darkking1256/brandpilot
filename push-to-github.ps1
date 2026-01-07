# PowerShell script to push MarketPilot AI to GitHub
# Run this script after creating a repository on GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "marketpilot-ai"
)

Write-Host "Setting up GitHub remote and pushing code..." -ForegroundColor Green

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists. Removing it..." -ForegroundColor Yellow
    git remote remove origin
}

# Add the remote repository
Write-Host "Adding remote repository..." -ForegroundColor Cyan
git remote add origin "https://github.com/$GitHubUsername/$RepoName.git"

# Rename branch to main if needed
Write-Host "Setting branch to 'main'..." -ForegroundColor Cyan
git branch -M main

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! Your code has been pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
} else {
    Write-Host "`nError: Failed to push to GitHub. Please check:" -ForegroundColor Red
    Write-Host "1. The repository exists on GitHub" -ForegroundColor Yellow
    Write-Host "2. You have the correct permissions" -ForegroundColor Yellow
    Write-Host "3. You're authenticated with GitHub" -ForegroundColor Yellow
}

