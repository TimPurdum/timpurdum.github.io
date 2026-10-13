using TimPurdum.Dev.Samples.SpatialDispatch.Contracts;
using TimPurdum.Dev.Samples.SpatialDispatch.Services;

namespace TimPurdum.Dev.Samples.SpatialDispatch.Demo;

/// <summary>
///     The no-credentials routing path: a straight connector between the technician and the job.
/// </summary>
/// <remarks>
///     A deliberate fallback rather than an error, because the recommendation is already settled by the time
///     anything is drawn.
/// </remarks>
public sealed class StraightLineRouteService : IRouteService
{
    public Task<RoutePath> GetRouteAsync(
        GeoPoint from,
        GeoPoint to,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(new RoutePath([from, to], IsFallback: true));
}
