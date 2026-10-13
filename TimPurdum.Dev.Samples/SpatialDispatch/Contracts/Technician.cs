namespace TimPurdum.Dev.Samples.SpatialDispatch.Contracts;

/// <summary>
///     Why a technician did or did not win the dispatch query. The board shows every candidate with its
///     outcome so the reader can see availability and territory acting as ordinary filters before distance
///     ranks whoever is left.
/// </summary>
public enum CandidateOutcome
{
    Recommended,
    Eligible,
    ExcludedByAvailability,
    ExcludedByTerritory
}

/// <summary>
///     A technician considered for one job, with the measured distance and the reason the query kept or
///     dropped them.
/// </summary>
public sealed record TechnicianCandidate(
    int Id,
    string Name,
    int TerritoryId,
    string TerritoryName,
    bool IsAvailable,
    string LocationLabel,
    GeoPoint Location,
    double DistanceMeters,
    CandidateOutcome Outcome);
