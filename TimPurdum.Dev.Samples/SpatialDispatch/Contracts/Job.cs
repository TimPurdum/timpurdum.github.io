namespace TimPurdum.Dev.Samples.SpatialDispatch.Contracts;

public enum JobPriority
{
    Routine,
    Urgent
}

public enum JobStatus
{
    Open,
    Assigned
}

/// <summary>
///     An open service job as the dispatcher sees it. Geocoding happens before this workflow, so the
///     customer location is already a stored coordinate.
/// </summary>
public sealed record Job(
    int Id,
    string Customer,
    string Summary,
    JobPriority Priority,
    string MapAnchor,
    GeoPoint Location);
