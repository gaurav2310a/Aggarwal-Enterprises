<#
  Aggarwal House — Appwrite bootstrap
  ------------------------------------
  Creates everything the site needs with the Appwrite CLI:
    project -> web client -> database -> leads collection (+ attributes + index)
    admins team -> two functions (create-lead, send-broadcast) + Resend variables

  USAGE
    1. Install the CLI:  npm i -g appwrite
    2. appwrite login        (or export APPWRITE_TOKEN)
    3. Edit the values below
    4. powershell -ExecutionPolicy Bypass -File appwrite/setup.ps1

  CLI flag names follow Appwrite CLI 1.6+; run `appwrite <command> --help`
  if your version spells something differently.
#>

param(
  [string]$ProjectName    = "Aggarwal House",
  [string]$ProjectId      = "aggarwalhouse",
  [string]$DatabaseId     = "aggarwal",
  [string]$CollectionId   = "leads",
  [string]$TeamId         = "admins",
  [string]$OwnerEmail     = "you@gmail.com",
  [string]$OwnerPassword  = "",
  [string]$ResendKey      = "",
  [string]$MailFrom       = "Aggarwal House <hello@yourdomain.com>",
  [string]$BrandName      = "Aggarwal House"
)

$ErrorActionPreference = "Stop"
function Step($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }

Step "Project + platform client"
appwrite project create --name $ProjectName --projectId $ProjectId
appwrite client create --name "Aggarwal Web" --projectId $ProjectId

Step "Database + leads collection (readable only by the admins team)"
appwrite databases create --databaseId $DatabaseId --name $DatabaseId --projectId $ProjectId
appwrite collections create `
  --collectionId $CollectionId `
  --databaseId $DatabaseId `
  --name $CollectionId `
  --documentSecurity true `
  --permissions read "team:$TeamId" `
  --permissions update "team:$TeamId" `
  --permissions delete "team:$TeamId" `
  --projectId $ProjectId

Step "Collection attributes"
$attrs = @(
  @{ key = "name";          type = "string";  size = 128;  required = $true  },
  @{ key = "mobile";        type = "string";  size = 20;   required = $true  },
  @{ key = "email";         type = "string";  size = 200;  required = $false },
  @{ key = "interest";      type = "string";  size = 20;   required = $false; default = "fashion" },
  @{ key = "whatsappOptIn"; type = "boolean"; size = 0;    required = $false; default = "false" },
  @{ key = "source";        type = "string";  size = 60;   required = $false; default = "coming_soon_site" },
  @{ key = "page";          type = "string";  size = 120;  required = $false; default = "/" },
  @{ key = "status";        type = "string";  size = 20;   required = $false; default = "new" },
  @{ key = "notes";         type = "string";  size = 1000; required = $false; default = "" }
)

foreach ($a in $attrs) {
  $args = @(
    "collections", "create-attribute",
    "--collectionId", $CollectionId,
    "--databaseId", $DatabaseId,
    "--attributeKey", $a.key,
    "--type", $a.type,
    "--required", "$($a.required)",
    "--projectId", $ProjectId
  )
  if ($a.type -eq "string") { $args += @("--size", "$($a.size)") }
  if ($a.ContainsKey("default")) { $args += @("--default", "$($a.default)") }
  & appwrite @args
}

Step "Index on `$createdAt"
appwrite collections create-index `
  --collectionId $CollectionId `
  --databaseId $DatabaseId `
  --key "createdAt_idx" `
  --type key `
  --attributes '$createdAt' `
  --projectId $ProjectId

Step "Admins team — the only accounts that can read leads"
appwrite teams create --teamId $TeamId --name "Admins" --projectId $ProjectId
if ($OwnerPassword -ne "") {
  appwrite teams create-membership `
    --teamId $TeamId `
    --email $OwnerEmail `
    --role owner `
    --password $OwnerPassword `
    --name "Aggarwal Admin" `
    --projectId $ProjectId
} else {
  Write-Host "No password given — add yourself in the console: Teams > $TeamId > Members > Add" -ForegroundColor Yellow
}

Step "Functions"
appwrite functions create --functionId "create-lead"   --name "create-lead"   --runtime "node-22" --entrypoint "src/index.js" --commands "npm install" --execute "any" --projectId $ProjectId
appwrite functions create --functionId "send-broadcast" --name "send-broadcast" --runtime "node-22" --entrypoint "src/index.js" --commands "npm install" --execute "any" --projectId $ProjectId
# Lock broadcast execution to the admins team (create-lead stays public).
appwrite functions update-permissions --functionId "send-broadcast" --permissions execute "team:$TeamId" --projectId $ProjectId

Step "Function variables (Resend + ids)"
if ($ResendKey -ne "") {
  foreach ($fn in @("create-lead", "send-broadcast")) {
    appwrite functions create-variable --functionId $fn --key "RESEND_API_KEY" --value $ResendKey  --projectId $ProjectId
    appwrite functions create-variable --functionId $fn --key "MAIL_FROM"      --value $MailFrom   --projectId $ProjectId
    appwrite functions create-variable --functionId $fn --key "BRAND_NAME"     --value $BrandName  --projectId $ProjectId
  }
  appwrite functions create-variable --functionId "create-lead"   --key "OWNER_EMAIL"             --value $OwnerEmail  --projectId $ProjectId
  appwrite functions create-variable --functionId "create-lead"   --key "APPWRITE_DATABASE_ID"     --value $DatabaseId  --projectId $ProjectId
  appwrite functions create-variable --functionId "create-lead"   --key "APPWRITE_LEADS_COLLECTION" --value $CollectionId --projectId $ProjectId
  appwrite functions create-variable --functionId "send-broadcast" --key "APPWRITE_DATABASE_ID"     --value $DatabaseId  --projectId $ProjectId
  appwrite functions create-variable --functionId "send-broadcast" --key "APPWRITE_LEADS_COLLECTION" --value $CollectionId --projectId $ProjectId
  appwrite functions create-variable --functionId "send-broadcast" --key "APPWRITE_ADMINS_TEAM"     --value $TeamId      --projectId $ProjectId
} else {
  Write-Host "Skipped Resend variables (pass -ResendKey re_... to set them)" -ForegroundColor Yellow
}

Step "Deploy functions"
appwrite functions create-deployment --functionId "create-lead"   --code "appwrite/functions/create-lead"   --projectId $ProjectId --entrypoint "src/index.js" --commands "npm install"
appwrite functions create-deployment --functionId "send-broadcast" --code "appwrite/functions/send-broadcast" --projectId $ProjectId --entrypoint "src/index.js" --commands "npm install"

Write-Host "`nDone. Next steps:" -ForegroundColor Green
Write-Host "  1. Appwrite console > Settings: copy the API endpoint + Project ID"
Write-Host "  2. Put them in .env.local (see .env.example) and run: npm run build"
Write-Host "  3. Extra admins: console > Auth > Users > Invite, then Teams > $TeamId > Add"
Write-Host "  4. Open https://your-domain.com/admin (no link exists on the public site)"
