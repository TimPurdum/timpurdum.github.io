namespace TimPurdum.Dev.Samples.SpatialDispatch.Services;

/// <summary>
///     Where the map fetches its GeoJSON feature layers.
/// </summary>
/// <remarks>
///     GeoJSON carries map features and DTOs carry business results. Keeping the URLs behind an interface
///     lets static files and API endpoints swap without touching the GeoBlazor layer wiring.
/// </remarks>
public interface IMapLayerSource
{
    string TerritoriesUrl { get; }

    string TechniciansUrl { get; }
}
