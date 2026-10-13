using dymaptic.GeoBlazor.Pro;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using TimPurdum.Dev.BlogGenerator;
using TimPurdum.Dev.Components;
using TimPurdum.Dev.Samples.FleetDashboard;
using TimPurdum.Dev.Samples.SpatialDispatch;

WebAssemblyHostBuilder builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<HeadOutlet>("head::after");
builder.Services.AddScoped(_ => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

builder.Services.AddGeoBlazorPro(builder.Configuration);
builder.Services.AddMemoryCache();

// Services for the TechBash 2026 samples embedded in the 2026-10-15 post. Both run entirely in the browser.
builder.Services.AddFleetDashboardSample();
builder.Services.AddSpatialDispatchSample(new Uri(builder.HostEnvironment.BaseAddress));

try
{
    await builder.AddGeneratedBlogContent();
}
catch (HttpRequestException)
{
    // AddGeneratedBlogContent fetches the current URL to discover which components to
    // mount. When GitHub Pages serves the 404 fallback (404.html), that fetch returns
    // a 404 status and throws. In that case, mount the component that repairs the URL
    // and redirects when a real page exists.
    builder.RootComponents.Add<NotFoundRedirect>("#not-found-redirect");
}

await builder.Build().RunAsync();