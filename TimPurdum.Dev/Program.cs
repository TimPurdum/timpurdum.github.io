using System.Reflection;
using dymaptic.GeoBlazor.Pro;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.JSInterop;
using TimPurdum.Dev;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<HeadOutlet>("head::after");
builder.Services.AddScoped(_ => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

builder.Services.AddGeoBlazorPro(builder.Configuration);

ServiceProvider sp = builder.Services.BuildServiceProvider();
IServiceScope scope = sp.CreateScope();
NavigationManager navigationManager = scope.ServiceProvider.GetRequiredService<NavigationManager>();
string url = navigationManager.Uri;
HttpClient client = scope.ServiceProvider.GetRequiredService<HttpClient>();
string htmlContent = await client.GetStringAsync(url);

List<Type> razorComponentTypes = Assembly.GetExecutingAssembly().GetTypes()
    .Where(t => t.IsSubclassOf(typeof(ComponentBase)) && !t.IsAbstract)
    .ToList();

foreach (Type type in razorComponentTypes)
{
    if (htmlContent.Contains($"id=\"{type.Name.PascalToKebabCase()}\""))
    {
        Console.WriteLine($"Adding component {type.Name} with selector #{type.Name.PascalToKebabCase()}");
        builder.RootComponents.Add(type, $"#{type.Name.PascalToKebabCase()}");
    }
    else
    {
        Console.WriteLine($"Skipping component {type.Name} as it is not referenced in the HTML content.");
    }
}

Console.WriteLine(url);

await builder.Build().RunAsync();