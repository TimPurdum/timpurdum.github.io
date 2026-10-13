

namespace TimPurdum.Dev.Samples.FleetDashboard.Streaming;


public interface IFleetFrameSource
{
    ValueTask<FleetFrame> GetFrameAsync(DateTimeOffset observedAtUtc,
        CancellationToken cancellationToken = default);
}
