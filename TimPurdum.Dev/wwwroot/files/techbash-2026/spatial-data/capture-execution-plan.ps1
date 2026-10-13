<#
.SYNOPSIS
    Captures SQL Server execution plans for the demo's two spatial queries, at a row count high
    enough for the optimizer's index choice to be meaningful.

.DESCRIPTION
    The presentation dataset is nine technicians and two territories. No plan taken against it says
    anything about spatial indexes, because at that size a scan is correct. The talk therefore shows
    a prepared execution plan rather than a live benchmark, and this script prepares it.

    It builds a throwaway database, SpatialDispatchPlan, on the same container as the demo: 200,000
    technician points and 40,000 territory polygons over a Pennsylvania bounding box, with the same
    column types, the same clustered primary keys, and the same GEOGRAPHY_AUTO_GRID spatial index
    definitions the real migration creates. The demo database is never touched. Writing 200,000
    technicians into it would break the GeoJSON endpoints mid-rehearsal, and the seeder's
    reseed-on-drift check would then fight whoever ran this.

    The query shapes are the actual EF Core output, read out of sys.dm_exec_query_stats while the
    application was running, not reconstructed by hand.

    Output is .sqlplan files under -OutputDirectory. SQL Server Management Studio opens a .sqlplan
    file directly as a graphical plan.

    Start the container first with `docker compose up -d` from projects/SpatialDispatch in a
    dymaptic/GeoBlazor-Samples checkout; the defaults below match that compose file.

.PARAMETER KeepDatabase
    Leave SpatialDispatchPlan in place afterward. Off by default; a 240,000-row scratch database is
    not something to leave behind on the demo container before a talk.
#>
[CmdletBinding()]
param(
    [string] $Container = 'spatialdispatch-sql',
    [string] $SaPassword = 'Dispatch!2026demo',
    [string] $OutputDirectory = 'plans',
    [switch] $KeepDatabase
)

$ErrorActionPreference = 'Stop'

# Two sqlcmd traps, both hit while writing this:
#   -I is required. Without QUOTED_IDENTIFIER ON, CREATE SPATIAL INDEX fails with error 1934 and the
#      message blames "SET options" without naming which caller turned them off.
#   -y 0 is required. The default column width truncates plan XML into unparseable fragments. It is
#      also mutually exclusive with both -h and -W on this client, so neither can be used here.
#   -b makes a failed batch return a nonzero exit code, so the $LASTEXITCODE check below catches it.
$sqlcmdArgs = @(
    '/opt/mssql-tools18/bin/sqlcmd', '-S', 'localhost', '-C',
    '-U', 'sa', '-P', $SaPassword, '-I', '-b', '-y', '0'
)

function Invoke-ContainerSql {
    param(
        [Parameter(Mandatory)] [string] $Sql,
        [string] $OutFile
    )

    $local = New-TemporaryFile
    try {
        Set-Content -LiteralPath $local -Value $Sql -Encoding UTF8
        docker cp $local "${Container}:/tmp/capture.sql" | Out-Null

        $arguments = $sqlcmdArgs + @('-i', '/tmp/capture.sql')
        if ($OutFile) { $arguments += @('-o', '/tmp/capture.out') }

        $output = docker exec $Container @arguments 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "sqlcmd failed: $output"
        }

        if ($OutFile) {
            docker cp "${Container}:/tmp/capture.out" $OutFile | Out-Null
        }

        return $output
    }
    finally {
        Remove-Item -LiteralPath $local -Force -ErrorAction SilentlyContinue
    }
}

# @jobLocation is the demo's urgent job, Summit Sports Catering. geography::Point takes latitude
# first, which is the opposite of the longitude-first order used everywhere else in the sample.
$preamble = @'
SET QUOTED_IDENTIFIER ON;
GO
USE SpatialDispatchPlan;
DECLARE @jobLocation geography = geography::Point(41.360406, -75.683967, 4326);
DECLARE @territoryId int = 17;
SET STATISTICS XML ON;
'@

$postamble = @'

SET STATISTICS XML OFF;
GO
'@

# The application's index-compatible query shapes, paired with the earlier forms that made the optimizer
# scan: ranking without the company-extent predicate, and containment with EF Core's TOP(2) row goal.
# Both pairs ask the same question of the same data.
$shapes = [ordered]@{
    'ranking-clustered-scan'     = @'
SELECT TOP(1) [t].[Id]
FROM [Technicians] AS [t]
WHERE [t].[TerritoryId] = @territoryId AND [t].[IsAvailable] = CAST(1 AS bit)
ORDER BY [t].[Location].STDistance(@jobLocation);
'@
    'ranking-spatial-seek'       = @'
SELECT TOP(1) [t].[Id]
FROM [Technicians] AS [t]
WHERE [t].[Location].STDistance(@jobLocation) <= 45269
  AND [t].[TerritoryId] = @territoryId AND [t].[IsAvailable] = CAST(1 AS bit)
ORDER BY [t].[Location].STDistance(@jobLocation);
'@
    'containment-clustered-scan' = @'
SELECT TOP(2) [t].[Id], [t].[Name]
FROM [Territories] AS [t]
WHERE [t].[Boundary].STContains(@jobLocation) = CAST(1 AS bit);
'@
    'containment-spatial-seek'   = @'
SELECT [t].[Id], [t].[Name]
FROM [Territories] AS [t]
WHERE [t].[Boundary].STContains(@jobLocation) = CAST(1 AS bit);
'@
}

$setup = @'
SET NOCOUNT ON;
IF DB_ID('SpatialDispatchPlan') IS NOT NULL
BEGIN
    ALTER DATABASE SpatialDispatchPlan SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SpatialDispatchPlan;
END
CREATE DATABASE SpatialDispatchPlan;
GO
SET QUOTED_IDENTIFIER ON;
GO
USE SpatialDispatchPlan;
GO
CREATE TABLE Technicians (
    Id int NOT NULL CONSTRAINT PK_Technicians PRIMARY KEY CLUSTERED,
    Name nvarchar(100) NOT NULL,
    TerritoryId int NOT NULL,
    IsAvailable bit NOT NULL,
    LocationLabel nvarchar(200) NOT NULL,
    Location geography NOT NULL
);
CREATE TABLE Territories (
    Id int NOT NULL CONSTRAINT PK_Territories PRIMARY KEY CLUSTERED,
    Name nvarchar(100) NOT NULL,
    Boundary geography NOT NULL
);
GO
WITH n AS (
    SELECT TOP (200000) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS i
    FROM sys.all_objects a CROSS JOIN sys.all_objects b
)
INSERT INTO Technicians (Id, Name, TerritoryId, IsAvailable, LocationLabel, Location)
SELECT i, CONCAT('Technician ', i), (i % 400) + 1,
       CASE WHEN i % 3 = 0 THEN 0 ELSE 1 END, CONCAT('Stop ', i),
       geography::Point(
           40.20 + (ABS(CHECKSUM(NEWID())) % 200000) / 100000.0,
          -80.50 + (ABS(CHECKSUM(NEWID())) % 550000) / 100000.0, 4326)
FROM n;
GO
-- Rings run counterclockwise. Geography reads a clockwise ring as the rest of the planet and reports
-- it as valid, so the wrong winding silently inverts containment instead of failing.
WITH n AS (
    SELECT TOP (40000) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS i
    FROM sys.all_objects a CROSS JOIN sys.all_objects b
), p AS (
    SELECT i,
           40.20 + (ABS(CHECKSUM(NEWID())) % 195000) / 100000.0 AS lat,
          -80.50 + (ABS(CHECKSUM(NEWID())) % 545000) / 100000.0 AS lon
    FROM n
)
INSERT INTO Territories (Id, Name, Boundary)
SELECT i, CONCAT('Territory ', i),
       geography::STGeomFromText(
           'POLYGON((' + FORMAT(lon,'0.000000') + ' ' + FORMAT(lat,'0.000000') + ', '
                       + FORMAT(lon+0.05,'0.000000') + ' ' + FORMAT(lat,'0.000000') + ', '
                       + FORMAT(lon+0.05,'0.000000') + ' ' + FORMAT(lat+0.05,'0.000000') + ', '
                       + FORMAT(lon,'0.000000') + ' ' + FORMAT(lat+0.05,'0.000000') + ', '
                       + FORMAT(lon,'0.000000') + ' ' + FORMAT(lat,'0.000000') + '))', 4326)
FROM p;
GO
CREATE SPATIAL INDEX SIX_Technicians_Location ON Technicians(Location) USING GEOGRAPHY_AUTO_GRID;
CREATE SPATIAL INDEX SIX_Territories_Boundary ON Territories(Boundary) USING GEOGRAPHY_AUTO_GRID;
GO
UPDATE STATISTICS Technicians;
UPDATE STATISTICS Territories;
GO
'@

$teardown = @'
IF DB_ID('SpatialDispatchPlan') IS NOT NULL
BEGIN
    ALTER DATABASE SpatialDispatchPlan SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SpatialDispatchPlan;
END
GO
'@

try {
    Write-Host 'Building SpatialDispatchPlan (200,000 points, 40,000 polygons)...'
    Invoke-ContainerSql -Sql $setup | Out-Null

    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

    foreach ($name in $shapes.Keys) {
        $target = Join-Path $OutputDirectory "$name.sqlplan"
        $raw = New-TemporaryFile

        try {
            Invoke-ContainerSql -Sql ($preamble + $shapes[$name] + $postamble) -OutFile $raw | Out-Null

            # sqlcmd surrounds the plan with batch messages and row counts. Keep only the plan element, so
            # the file is a .sqlplan SSMS will open rather than a transcript that contains one.
            $plan = [regex]::Match((Get-Content -LiteralPath $raw -Raw), '(?s)<ShowPlanXML.*?</ShowPlanXML>')
        }
        finally {
            Remove-Item -LiteralPath $raw -Force -ErrorAction SilentlyContinue
        }

        if (-not $plan.Success) {
            throw "No plan XML captured for $name."
        }

        Set-Content -LiteralPath $target -Value $plan.Value -Encoding UTF8 -NoNewline

        # Report the index choice rather than trusting that the shape did what it was meant to. A seek
        # count of zero on a *-spatial-seek shape means the capture is wrong, not that the plan is boring.
        $seeks = ([regex]::Matches($plan.Value, 'Index="\[SIX_[^\]]*\]"')).Count
        $rowsRead = [regex]::Matches($plan.Value, 'ActualRowsRead="(\d+)"') |
            ForEach-Object { [int]$_.Groups[1].Value } |
            Measure-Object -Maximum |
            Select-Object -ExpandProperty Maximum
        $ops = [regex]::Matches($plan.Value, 'PhysicalOp="([^"]*)"') |
            ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

        Write-Host ("  {0,-28} spatial index refs: {1}  max rows read: {2}" -f $name, $seeks, $rowsRead)
        Write-Host ("  {0,-28} {1}" -f '', ($ops -join ', '))

        if ($name.EndsWith('-spatial-seek') -and $seeks -eq 0) {
            throw "$name did not reference a spatial index."
        }
    }
}
finally {
    # Runs after a failed setup or a failed assertion too, so a scratch database is not left behind.
    # The teardown SQL checks DB_ID first, so it is safe after a partial setup.
    if (-not $KeepDatabase) {
        Invoke-ContainerSql -Sql $teardown | Out-Null
        Write-Host 'Dropped SpatialDispatchPlan.'
    }
}
