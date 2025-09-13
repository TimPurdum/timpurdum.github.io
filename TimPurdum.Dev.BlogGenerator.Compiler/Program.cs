﻿using System.Reflection;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using TimPurdum.Dev.BlogGenerator.Compiler;
using TimPurdum.Dev.BlogGenerator.Shared;
using TimPurdum.Dev.BlogGenerator.Shared.AbstractTemplates;

string? blogProjectFolderPath = null;
string? blogProjectName = null;

string? currentFolder = Assembly.GetExecutingAssembly().Location;
string oldFolder = currentFolder;

Regex webAssemblySdkRegex = new(@"<Project\s+Sdk=""Microsoft\.NET\.Sdk\.BlazorWebAssembly""\s*>", RegexOptions.Compiled);

while (blogProjectFolderPath is null)
{
    currentFolder = Directory.GetParent(currentFolder)?.FullName;
    if (currentFolder is null)
    {
        throw new Exception("Unable to find project folder");
    }
    string[] projectFiles = Directory.GetFiles(currentFolder, "*.csproj", SearchOption.AllDirectories);
    foreach (string projectFile in projectFiles)
    {
        string projectFolder = Path.GetDirectoryName(projectFile)!;
        if (projectFolder == oldFolder)
        {
            continue;
        }
        
        string[] projectFileLines = File.ReadAllLines(projectFile);
        if (projectFileLines.Any(line => webAssemblySdkRegex.IsMatch(line)))
        {
            blogProjectFolderPath = projectFolder;
            blogProjectName = Path.GetFileNameWithoutExtension(projectFile);
            break;
        }
    }
}
if (blogProjectFolderPath is null)
{
    throw new InvalidOperationException("Could not find a Blazor WebAssembly project in the parent directories.");
}

Console.WriteLine($"Found Blazor WebAssembly project at: {blogProjectFolderPath}");


IServiceCollection services = new ServiceCollection();
services.AddLogging();
string appSettingsPath = Path.Combine(blogProjectFolderPath, "wwwroot", "appsettings.json");
IConfiguration configuration = new ConfigurationBuilder()
    .AddJsonFile(appSettingsPath, optional: false, reloadOnChange: true)
    .AddEnvironmentVariables()
    .Build();
services.AddSingleton(configuration);
services.AddOptions<BlogSettings>()
    .Configure<IConfiguration>((settings, config) =>
{
    config.GetSection("BlogSettings").Bind(settings);
});
services.AddSingleton<BlogSettings>(sp => sp.GetRequiredService<IOptions<BlogSettings>>().Value);
#pragma warning disable ASP0000
IServiceProvider serviceProvider = services.BuildServiceProvider();
#pragma warning restore ASP0000

BlogSettings blogSettings = serviceProvider.GetRequiredService<BlogSettings>();
blogSettings.OutputWebRootPath = Path.Combine(blogProjectFolderPath, blogSettings.OutputWebRootPath);
blogSettings.OutputComponentsPath = Path.Combine(blogProjectFolderPath, blogSettings.OutputComponentsPath);
blogSettings.PagesContentPath = Path.Combine(blogProjectFolderPath, blogSettings.PagesContentPath);
blogSettings.PostsContentPath = Path.Combine(blogProjectFolderPath, blogSettings.PostsContentPath);
blogSettings.SourceTemplatesPath = Path.Combine(blogProjectFolderPath, blogSettings.SourceTemplatesPath);
Directory.CreateDirectory(blogSettings.OutputWebRootPath);
Directory.CreateDirectory(blogSettings.OutputComponentsPath);

string? rootTemplateFilePath = null;
foreach (string file in Directory.GetFiles(blogSettings.SourceTemplatesPath, "*.razor", 
             SearchOption.AllDirectories))
{
    await foreach (string line in File.ReadLinesAsync(file))
    {
        if (line.Contains("@inherits"))
        {
            if (line.Contains($"inherits {nameof(BaseRootTemplate)}"))
            {
                rootTemplateFilePath = file;
                break;
            }
        }
    }

    if (rootTemplateFilePath is not null)
    {
        break;
    }
}

if (rootTemplateFilePath is null)
{
    throw new InvalidOperationException(
        $"Could not find a Razor template inheriting from {nameof(BaseRootTemplate)} in {blogSettings.SourceTemplatesPath}");
}

Type? rootTemplateType = RazorGenerator.GenerateRazorType(Path.GetFileNameWithoutExtension(rootTemplateFilePath), 
    File.ReadAllText(rootTemplateFilePath));

if (rootTemplateType is null)
{
    throw new InvalidOperationException($"Failed to compile root template Razor file from path {rootTemplateFilePath}.");
}

await Generator.GenerateSite(serviceProvider, rootTemplateType);