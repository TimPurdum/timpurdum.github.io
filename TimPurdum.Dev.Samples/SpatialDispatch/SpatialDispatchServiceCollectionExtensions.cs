using Microsoft.Extensions.DependencyInjection;
using TimPurdum.Dev.Samples.SpatialDispatch.Demo;
using TimPurdum.Dev.Samples.SpatialDispatch.Services;

namespace TimPurdum.Dev.Samples.SpatialDispatch;

public static class SpatialDispatchServiceCollectionExtensions
{
    /// <summary>
    ///     Registers the services <see cref="SpatialDispatchSample" /> needs to run with no server: the
    ///     in-memory dispatch answer, the straight-line route, and GeoJSON layers served as static assets of
    ///     this library.
    /// </summary>
    /// <param name="baseAddress">The host's base address, usually <c>HostEnvironment.BaseAddress</c>.</param>
    /// <remarks>
    ///     Lifetimes match the original sample's browser-only host. The layer URLs resolve to
    ///     <c>_content/TimPurdum.Dev.Samples/spatial-dispatch/data/*.geojson</c>.
    /// </remarks>
    public static IServiceCollection AddSpatialDispatchSample(this IServiceCollection services, Uri baseAddress)
    {
        string layerBase = new Uri(baseAddress, "_content/TimPurdum.Dev.Samples/spatial-dispatch/").AbsoluteUri;

        services.AddScoped<IDispatchService, InMemoryDispatchService>();
        services.AddScoped<IRouteService, StraightLineRouteService>();
        services.AddScoped<IMapLayerSource>(_ => new StaticFileMapLayerSource(layerBase));

        return services;
    }
}
