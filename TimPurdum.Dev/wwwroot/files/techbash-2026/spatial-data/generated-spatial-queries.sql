-- Representative SQL emitted by EF Core for the two spatial queries in
-- SqlServerDispatchService.GetDispatchAsync. Parameter values are supplied by EF Core.

-- Which territory contains the selected job?
SELECT [t].[Id], [t].[Name]
FROM [Territories] AS [t]
WHERE [t].[Boundary].STContains(@jobLocation) = CAST(1 AS bit);

-- Which available technician assigned to that territory is closest?
SELECT TOP(1) [t].[Id]
FROM [Technicians] AS [t]
WHERE [t].[Location].STDistance(@jobLocation) <= 45269
    AND [t].[TerritoryId] = @territoryId
    AND [t].[IsAvailable] = CAST(1 AS bit)
ORDER BY [t].[Location].STDistance(@jobLocation);
