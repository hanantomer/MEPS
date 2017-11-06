(Get-Content ..\index.html) | ForEach-Object { 
	$_ -replace "(ver=)\d*?(TimeStamp)", '$1TIME_STAMP$2'
} | Set-Content ..\index.html

(Get-Content  ..\index.html) | ForEach-Object { 
	$str = $(Get-Date -format 'yyyyMMddhhmmss')
	$_ -replace "TIME_STAMP" , $str
} | Set-Content  ..\index.html

