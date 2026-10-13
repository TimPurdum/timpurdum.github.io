using TimPurdum.Dev.Samples.SpatialDispatch.Contracts;

namespace TimPurdum.Dev.Samples.SpatialDispatch.Services;

/// <summary>
///     The dispatch workflow the board consumes.
/// </summary>
/// <remarks>
///     The original sample fills this seam with SQL Server spatial queries behind a Minimal API. The blog
///     embed uses the in-memory demo implementation, and the board does not change between the two.
/// </remarks>
public interface IDispatchService
{
    Task<IReadOnlyList<Job>> GetOpenJobsAsync(CancellationToken cancellationToken = default);

    Task<DispatchResult> GetDispatchAsync(int jobId, CancellationToken cancellationToken = default);
}
