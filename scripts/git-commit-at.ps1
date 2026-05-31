param(
  [Parameter(Mandatory = $true)]
  [string]$Date,

  [Parameter(Mandatory = $true)]
  [string]$Message
)

$parsedDate = [DateTimeOffset]::Parse($Date, [Globalization.CultureInfo]::InvariantCulture)
$gitDate = $parsedDate.ToString("yyyy-MM-ddTHH:mm:sszzz")

$env:GIT_AUTHOR_DATE = $gitDate
$env:GIT_COMMITTER_DATE = $gitDate

git commit -m $Message
