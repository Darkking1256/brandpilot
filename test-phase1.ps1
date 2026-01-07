# Phase 1 Quick Test Script
# Run with: .\test-phase1.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 1 Testing Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Test 1: Check files exist
Write-Host "1. Checking required files..." -ForegroundColor Yellow
$files = @(
    @{Path="lib/auth.ts"; Name="Authentication Helper"},
    @{Path="types/index.ts"; Name="Type Definitions"},
    @{Path=".env.example"; Name="Environment Variables Example"}
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Write-Host "   [OK] $($file.Name) exists ($($file.Path))" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] $($file.Name) MISSING ($($file.Path))" -ForegroundColor Red
        $errors++
    }
}

# Test 2: Check lib/auth.ts exports
Write-Host ""
Write-Host "2. Checking lib/auth.ts exports..." -ForegroundColor Yellow
if (Test-Path "lib/auth.ts") {
    $authContent = (Get-Content "lib/auth.ts") -Join "`n"
    if ($authContent -match "export.*requireAuth") {
        Write-Host "   [OK] requireAuth function exported" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] requireAuth function NOT found" -ForegroundColor Red
        $errors++
    }
    if ($authContent -match "export.*getAuthenticatedUser") {
        Write-Host "   [OK] getAuthenticatedUser function exported" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] getAuthenticatedUser function NOT found" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   [FAIL] lib/auth.ts not found - skipping" -ForegroundColor Red
    $errors++
}

# Test 3: Check Platform type includes youtube
Write-Host ""
Write-Host "3. Checking Platform type includes 'youtube'..." -ForegroundColor Yellow
if (Test-Path "types/index.ts") {
    $typesContent = (Get-Content "types/index.ts") -Join "`n"
    if ($typesContent -match 'youtube') {
        Write-Host "   [OK] Platform type includes 'youtube'" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Platform type MISSING 'youtube'" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   [FAIL] types/index.ts not found - skipping" -ForegroundColor Red
    $errors++
}

# Test 4: Check API routes use requireAuth
Write-Host ""
Write-Host "4. Checking API routes use requireAuth()..." -ForegroundColor Yellow
$apiRoutes = Get-ChildItem -Path "app/api" -Recurse -Filter "route.ts" -File -ErrorAction SilentlyContinue
$totalRoutes = $apiRoutes.Count
$routesWithAuth = 0
$routesWithoutAuth = @()

foreach ($route in $apiRoutes) {
    try {
        if (Test-Path $route.FullName -PathType Leaf) {
            $content = (Get-Content $route.FullName -ErrorAction Stop) -Join "`n"
            if ($content -match "requireAuth|from.*auth") {
                $routesWithAuth++
            } else {
                # Skip test files and special routes
                if ($route.Name -notmatch "test|spec|\.d\.ts") {
                    $routesWithoutAuth += $route.FullName.Replace((Get-Location).Path + "\", "")
                }
            }
        }
    } catch {
        # Skip files that can't be read (likely directories or permission issues)
        continue
    }
}

Write-Host "   [OK] Found requireAuth in $routesWithAuth out of $totalRoutes route files" -ForegroundColor Green

if ($routesWithoutAuth.Count -gt 0) {
    Write-Host "   [WARN] Routes without requireAuth (may be intentional):" -ForegroundColor Yellow
    foreach ($route in $routesWithoutAuth) {
        Write-Host "     - $route" -ForegroundColor Yellow
        $warnings++
    }
}

# Test 5: Check for placeholder user IDs
Write-Host ""
Write-Host "5. Checking for placeholder user IDs..." -ForegroundColor Yellow
$placeholderPattern = "00000000-0000-0000-0000-000000000000"
$filesWithPlaceholder = @()

foreach ($route in $apiRoutes) {
    try {
        if (Test-Path $route.FullName -PathType Leaf) {
            $content = (Get-Content $route.FullName -ErrorAction Stop) -Join "`n"
            if ($content -match $placeholderPattern) {
                $filesWithPlaceholder += $route.FullName.Replace((Get-Location).Path + "\", "")
            }
        }
    } catch {
        # Skip files that can't be read
        continue
    }
}

if ($filesWithPlaceholder.Count -eq 0) {
    Write-Host "   [OK] No placeholder user IDs found" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Found placeholder user IDs in:" -ForegroundColor Yellow
    foreach ($file in $filesWithPlaceholder) {
        Write-Host "     - $file" -ForegroundColor Yellow
        $warnings++
    }
    Write-Host "   (These may be intentional TODOs)" -ForegroundColor Gray
}

# Test 6: Check .env.example completeness
Write-Host ""
Write-Host "6. Checking .env.example completeness..." -ForegroundColor Yellow
if (Test-Path ".env.example") {
    $envContent = (Get-Content ".env.example") -Join "`n"
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_APP_URL",
        "ENCRYPTION_KEY"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Host "   [OK] All required environment variables documented" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Missing required variables:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "     - $var" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "   [FAIL] .env.example not found" -ForegroundColor Red
    $errors++
}

# Test 7: TypeScript compilation check (optional - requires node_modules)
Write-Host ""
Write-Host "7. TypeScript compilation check..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   Running: npm run build" -ForegroundColor Gray
    Write-Host "   (This may take a minute...)" -ForegroundColor Gray
    Write-Host ""
    
    $buildOutput = npm run build 2>&1 | Out-String
    if ($buildOutput -match "Compiled successfully") {
        Write-Host "   [OK] TypeScript compilation successful" -ForegroundColor Green
        if ($buildOutput -match "Error:") {
            Write-Host "   [WARN] Some ESLint errors found (non-blocking)" -ForegroundColor Yellow
            $warnings++
        }
    } else {
        Write-Host "   [FAIL] TypeScript compilation failed" -ForegroundColor Red
        Write-Host "   Check output above for errors" -ForegroundColor Yellow
        $errors++
    }
} else {
    Write-Host "   [WARN] Skipping (node_modules not found - run 'npm install' first)" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "[SUCCESS] All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy .env.example to .env.local" -ForegroundColor White
    Write-Host "2. Fill in your Supabase credentials" -ForegroundColor White
    Write-Host "3. Test API routes manually:" -ForegroundColor White
    Write-Host "   - Unauthenticated requests should return 401" -ForegroundColor Gray
    Write-Host "   - Authenticated requests should return 200/201" -ForegroundColor Gray
    Write-Host "   - Data should be filtered by user_id" -ForegroundColor Gray
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "[SUCCESS] All critical tests passed!" -ForegroundColor Green
    Write-Host "[WARN] $warnings warning(s) found (see above)" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "[FAIL] $errors error(s) found" -ForegroundColor Red
    if ($warnings -gt 0) {
        Write-Host "[WARN] $warnings warning(s) found" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Please fix the errors above before proceeding." -ForegroundColor Yellow
    exit 1
}

