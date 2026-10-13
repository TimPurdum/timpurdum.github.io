using TimPurdum.Dev.Samples.SpatialDispatch.Contracts;

namespace TimPurdum.Dev.Samples.SpatialDispatch.Demo;

/// <summary>
///     The demo seed records: jobs, technicians, territories, and the measured distances between them.
/// </summary>
/// <remarks>
///     Copied from the original sample, minus the members only its SQL Server seeder used (boundary WKT,
///     SRID, company extent). Every coordinate is longitude-first WGS 84.
/// </remarks>
public static class DemoContract
{
    public const int CanonicalJobId = 1001;
    public const int NorthValleyId = 1;
    public const int SouthValleyId = 2;

    public static readonly Territory NorthValley = new(NorthValleyId, "North Valley");
    public static readonly Territory SouthValley = new(SouthValleyId, "South Valley");

    public static IReadOnlyList<Territory> Territories { get; } = [NorthValley, SouthValley];

    /// <summary>
    ///     The dispatcher's open jobs. The two routine jobs exist so the priority ordering in the list means
    ///     something and so one selection lands in each territory.
    /// </summary>
    public static IReadOnlyList<Job> Jobs { get; } =
    [
        new Job(
            CanonicalJobId,
            "Summit Sports Catering",
            "Walk-in freezer temperature alarm",
            JobPriority.Urgent,
            "PNC Field, Moosic, Pennsylvania",
            new GeoPoint(-75.683967, 41.360406)),
        new Job(
            1002,
            "Anthracite Brewing Co.",
            "Glycol chiller running warm",
            JobPriority.Routine,
            "Wilkes-Barre, Pennsylvania",
            new GeoPoint(-75.860000, 41.245000)),
        new Job(
            1003,
            "Lackawanna Print Works",
            "Rooftop unit short-cycling",
            JobPriority.Routine,
            "Scranton, Pennsylvania",
            new GeoPoint(-75.660000, 41.400000))
    ];

    /// <summary>
    ///     The territory whose boundary contains each job. The original sample answers this with an
    ///     <c>STContains</c> query; the shape of the answer is the same.
    /// </summary>
    public static IReadOnlyDictionary<int, int> ContainingTerritoryByJobId { get; } =
        new Dictionary<int, int>
        {
            [CanonicalJobId] = NorthValleyId,
            [1002] = SouthValleyId,
            [1003] = NorthValleyId
        };

    /// <summary>
    ///     The technician roster. Every location lies inside that technician's assigned territory.
    /// </summary>
    public static IReadOnlyList<DemoTechnician> Technicians { get; } =
    [
        new DemoTechnician(201, "Morgan Lee", NorthValleyId, IsAvailable: false,
            "Montage service stop", new GeoPoint(-75.680500, 41.361200)),
        new DemoTechnician(202, "Riley Chen", SouthValleyId, IsAvailable: true,
            "Moosic service stop", new GeoPoint(-75.687000, 41.350500)),
        new DemoTechnician(203, "Jordan Alvarez", NorthValleyId, IsAvailable: true,
            "Steamtown service stop", new GeoPoint(-75.671329, 41.410730)),
        new DemoTechnician(204, "Casey Patel", NorthValleyId, IsAvailable: true,
            "Dickson City service stop", new GeoPoint(-75.625401, 41.465984)),
        new DemoTechnician(205, "Avery Brooks", NorthValleyId, IsAvailable: true,
            "Archbald service stop", new GeoPoint(-75.610000, 41.487000)),
        new DemoTechnician(206, "Devon Ortiz", NorthValleyId, IsAvailable: true,
            "Clarks Summit service stop", new GeoPoint(-75.790000, 41.462000)),
        new DemoTechnician(207, "Harper Nguyen", SouthValleyId, IsAvailable: true,
            "Wilkes-Barre service stop", new GeoPoint(-75.880000, 41.230000)),
        new DemoTechnician(208, "Sam Okafor", SouthValleyId, IsAvailable: true,
            "Route 115 service stop", new GeoPoint(-75.700000, 41.220000)),
        new DemoTechnician(209, "Quinn Delgado", SouthValleyId, IsAvailable: false,
            "Bear Creek service stop", new GeoPoint(-75.760000, 41.205000))
    ];

    /// <summary>
    ///     Reference geodesic distances in meters from each job to every technician, rounded to the nearest
    ///     meter. The outer key is the job, the inner key the technician.
    /// </summary>
    /// <remarks>
    ///     Every value came from <c>geography::STDistance</c> on SQL Server rather than from a formula here,
    ///     which is why this in-memory provider and the database-backed original agree on the ranking.
    /// </remarks>
    public static IReadOnlyDictionary<int, IReadOnlyDictionary<int, double>> ReferenceDistanceMeters { get; } =
        new Dictionary<int, IReadOnlyDictionary<int, double>>
        {
            [CanonicalJobId] = new Dictionary<int, double>
            {
                [201] = 303,
                [202] = 1_129,
                [203] = 5_688,
                [204] = 12_707,
                [205] = 15_359,
                [206] = 14_349,
                [207] = 21_894,
                [208] = 15_651,
                [209] = 18_397
            },
            [1002] = new Dictionary<int, double>
            {
                [201] = 19_812,
                [202] = 18_634,
                [203] = 24_254,
                [204] = 31_428,
                [205] = 34_057,
                [206] = 24_802,
                [207] = 2_364,
                [208] = 13_699,
                [209] = 9_489
            },
            [1003] = new Dictionary<int, double>
            {
                [201] = 4_638,
                [202] = 5_943,
                [203] = 1_522,
                [204] = 7_878,
                [205] = 10_527,
                [206] = 12_864,
                [207] = 26_378,
                [208] = 20_269,
                [209] = 23_220
            }
        };

    public static double ReferenceDistance(int jobId, int technicianId) =>
        ReferenceDistanceMeters[jobId][technicianId];

    public static Territory TerritoryById(int id) =>
        Territories.Single(t => t.Id == id);

    /// <summary>A technician as stored, before any one job turns them into a ranked candidate.</summary>
    public sealed record DemoTechnician(
        int Id,
        string Name,
        int TerritoryId,
        bool IsAvailable,
        string LocationLabel,
        GeoPoint Location);
}
