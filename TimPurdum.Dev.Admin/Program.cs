using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using TimPurdum.Dev.BlogGenerator.Admin;
using TimPurdum.Dev.BlogGenerator.Admin.Services;

WebAssemblyHostBuilder builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddBlogAdmin(opts =>
{
    opts.Repo = new GitHubRepoConfig(Owner: "TimPurdum", Repo: "timpurdum.github.io");
    opts.PatStorageKey = "timpurdum.admin.pat";
    opts.SiteName = "Tim Purdum";
    opts.ImagesRoot = "TimPurdum.Dev/wwwroot";
    opts.ImageFolders = ["images"];
    opts.PublicImageUrlPrefix = "";
    opts.ConfigurePost(p => p.ContentPath = "TimPurdum.Dev.Source/Content/Posts");
    opts.RemoveDefaultPage();
});

await builder.Build().RunAsync();
