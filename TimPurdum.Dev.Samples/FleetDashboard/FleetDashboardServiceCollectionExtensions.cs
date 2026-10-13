using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TimPurdum.Dev.Samples.FleetDashboard.Streaming;

namespace TimPurdum.Dev.Samples.FleetDashboard;

public static class FleetDashboardServiceCollectionExtensions
{
    /// <summary>Registers what <see cref="FleetDashboardSample"/> injects: the in-browser frame source
    /// and a <see cref="TimeProvider"/>. The source is scoped, as in the original sample, which is
    /// one instance for the lifetime of a WebAssembly app.</summary>
    public static IServiceCollection AddFleetDashboardSample(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);
        services.AddScoped<IFleetFrameSource, BrowserFleetFrameSource>();
        return services;
    }
}
