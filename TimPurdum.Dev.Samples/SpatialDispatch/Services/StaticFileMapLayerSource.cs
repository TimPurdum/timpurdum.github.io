namespace TimPurdum.Dev.Samples.SpatialDispatch.Services;

/// <summary>
///     Serves the map's feature layers from GeoJSON files shipped as static assets.
/// </summary>
/// <param name="baseUri">The folder that contains <c>data/</c>, with or without a trailing slash.</param>
public sealed class StaticFileMapLayerSource(string baseUri) : IMapLayerSource
{
    public string TerritoriesUrl { get; } = Combine(baseUri, "data/territories.geojson");

    public string TechniciansUrl { get; } = Combine(baseUri, "data/technicians.geojson");

    private static string Combine(string baseUri, string relativePath) =>
        $"{baseUri.TrimEnd('/')}/{relativePath}";
}
