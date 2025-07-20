using System.Reflection;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.Web.HtmlRendering;
using TimPurdum.Dev.BlogCreator.Components;

namespace TimPurdum.Dev.BlogCreator;

public static class Generator
{
    static Generator()
    {
        IServiceCollection services = new ServiceCollection();
        services.AddLogging();
        ServiceProvider = services.BuildServiceProvider();
        LoggerFactory = ServiceProvider.GetRequiredService<ILoggerFactory>();
    }

    public static async Task GenerateSite()
    {
        ClearOldPagesAndPosts();
        
        await using HtmlRenderer renderer = new(ServiceProvider, LoggerFactory);
        
        List<PostMetaData> posts = MarkupParser.GeneratePostMetaDatas();
        List<LinkData> navLinks = [];
        
        foreach (PostMetaData post in posts)
        {
            navLinks.Add(new LinkData(post.Title, post.SubTitle, post.Url,
                post.PublishedDate, post.Author));
        }
        
        List<PageMetaData> pages = await MarkupParser.GeneratePageMetaDatas(navLinks);
        
        foreach (PageMetaData page in pages)
        {
            string html = await RenderPage(page, renderer, navLinks);
            string fileName = Path.GetFileNameWithoutExtension(page.Url);
            if (string.IsNullOrWhiteSpace(fileName) || fileName == Path.DirectorySeparatorChar.ToString())
            {
                fileName = "index";
            }
            string filePath = Path.Combine(Directories.OutputWebRoot, $"{fileName}.html");
            await File.WriteAllTextAsync(filePath, html);

            await CreateComponents(page.RazorComponents);
        }
        
        foreach (PostMetaData post in posts)
        {
            string html = await RenderPost(post, renderer, navLinks);
            string outputFolder = Path.Combine(
                Directories.OutputWebRoot, 
                "post", 
                post.PublishedDate.Year.ToString(),
                post.PublishedDate.Month.ToString(), 
                post.PublishedDate.Day.ToString());
            Directory.CreateDirectory(outputFolder);
            string fileName = Path.GetFileNameWithoutExtension(post.Url);
            string filePath = Path.Combine(outputFolder, $"{fileName}.html");
            await File.WriteAllTextAsync(filePath, html);

            await CreateComponents(post.RazorComponents);
        }
        
        // Generate the RSS feed
        string rssXml = await RssFeedGenerator.GenerateRssFeed(posts);
        string rssFilePath = Path.Combine(Directories.OutputWebRoot, "feed.xml");
        await File.WriteAllTextAsync(rssFilePath, rssXml);
    }
    
    public static async Task<string> RenderComponent(Dictionary<string, object?> parameters)
    {
        await using HtmlRenderer renderer = new(ServiceProvider, LoggerFactory);
        return await renderer.Dispatcher.InvokeAsync(async () =>
        {
            ParameterView parameterView = ParameterView.FromDictionary(parameters);

            HtmlRootComponent root = await renderer
                .RenderComponentAsync<MarkupComponent>(parameterView);

            return root.ToHtmlString();
        });
    }
    
    private static void ClearOldPagesAndPosts()
    {
        if (Directory.Exists(Directories.OutputWebRoot))
        {
            string[] htmlPages = Directory.GetFiles(Directories.OutputWebRoot, "*.html", SearchOption.AllDirectories);
            foreach (string htmlPage in htmlPages)
            {
                File.Delete(htmlPage);
            }
        }
        
        if (Directory.Exists(Directories.OutputBlogComponents))
        {
            string[] componentFiles = Directory.GetFiles(Directories.OutputBlogComponents, "*.razor", SearchOption.AllDirectories);
            foreach (string componentFile in componentFiles)
            {
                File.Delete(componentFile);
            }
        }
    }

    private static async Task<string> RenderPage(PageMetaData page, HtmlRenderer renderer, List<LinkData> navLinks)
    {
        return await renderer.Dispatcher.InvokeAsync(async () =>
        {
            Dictionary<string, object?> parameters = new()
            {
                { nameof(RootTemplate.Title), (MarkupString)page.Title },
                { nameof(RootTemplate.Content), (MarkupString)page.Content },
                { nameof(RootTemplate.Layout), page.Layout },
                { nameof(RootTemplate.NavLinks), navLinks },
                { nameof(RootTemplate.Scripts), page.ScriptTags.Select(s => (MarkupString)s).ToList() }
            };
            ParameterView parameterView = ParameterView.FromDictionary(parameters);
            HtmlRootComponent root = await renderer
                .RenderComponentAsync<RootTemplate>(parameterView);
            return root.ToHtmlString();
        });
    }
    
    private static async Task<string> RenderPost(PostMetaData post, HtmlRenderer renderer, List<LinkData> navLinks)
    {
        return await renderer.Dispatcher.InvokeAsync(async () =>
        {
            Dictionary<string, object?> parameters = new()
            {
                { nameof(RootTemplate.Layout), post.Layout },
                { nameof(RootTemplate.NavLinks), navLinks },
                { nameof(RootTemplate.Title), (MarkupString)post.Title },
                { nameof(RootTemplate.SubTitle), (MarkupString)post.SubTitle },
                { nameof(RootTemplate.Description), (MarkupString)post.Description },
                { nameof(RootTemplate.PublishedDate), post.PublishedDate },
                { nameof(RootTemplate.Author), post.Author },
                { nameof(RootTemplate.Url), post.Url },
                { nameof(RootTemplate.Content), (MarkupString)post.Content },
                { nameof(RootTemplate.SiteName), Settings.SiteName },
                { nameof(RootTemplate.HeaderLinks), (MarkupString)Settings.HeaderLinks },
                { nameof(RootTemplate.Scripts), post.ScriptTags.Select(s => (MarkupString)s).ToList() }
            };
            ParameterView parameterView = ParameterView.FromDictionary(parameters);
            HtmlRootComponent root = await renderer
                .RenderComponentAsync<RootTemplate>(parameterView);
            return root.ToHtmlString();
        });
    }

    private static async Task CreateComponents(Dictionary<string, string> components)
    {
        foreach (KeyValuePair<string, string> kvp in components)
        {
            string componentName = kvp.Key;
            string componentContent = kvp.Value;

            // Write the component content to a file
            string componentFilePath = Path.Combine(Directories.OutputBlogComponents, 
                $"{componentName.KebabCaseToPascalCase()}.razor");
            await File.WriteAllTextAsync(componentFilePath, componentContent);

            Console.WriteLine($"Created Razor component: {componentFilePath}");
        }
    }
    
    private static readonly ServiceProvider ServiceProvider;
    private static readonly ILoggerFactory LoggerFactory;
}