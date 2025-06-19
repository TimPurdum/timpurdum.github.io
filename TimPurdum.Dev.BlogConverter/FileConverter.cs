using Markdig;
using Markdig.Helpers;

namespace TimPurdum.Dev.BlogConverter;

public static class FileConverter
{
    public static PostMetaData? GeneratePost(string fileName, string content, DateTime publishedDate,
        Dictionary<string, string> templates)
    {
        // Extract YAML front-matter using regex
        var match = Resources.FileRegex.Match(content);
        if (!match.Success) throw new ArgumentException("Content does not contain valid YAML front-matter.");

        var yaml = match.Groups[1].Value;
        string markdownContent = match.Groups[2].Value;
        List<string> markdownLines = markdownContent.Split(Environment.NewLine).ToList();
        int razorBlockNesting = 0;
        bool inSampleCodeBlock = false;
        int razorCodeBlockStartingIndex = -1;
        string? razorCodeBlockContent = null;
        for (var i = 0; i < markdownLines.Count; i++)
        {
            var line = markdownLines[i];
            if (inSampleCodeBlock)
            {
                if (line.StartsWith("```") || line.StartsWith("~~~"))
                {
                    inSampleCodeBlock = false; // End of code block
                }
            }
            else if (razorBlockNesting > 0
                     && line.StartsWith("</") 
                     && line.Length > 2 && line[2].IsAlphaUpper())
            {
                razorBlockNesting--; // End of custom Razor block
            }
            else if (razorBlockNesting == 0 && (line.StartsWith("```") || line.StartsWith("~~~")))
            {
                inSampleCodeBlock = true; // Start of code block
            }
            else if (line.StartsWith("<") 
                     && line.Length > 1
                     && line[1].IsAlphaUpper())
            {
                razorBlockNesting++; // Start of custom Razor block
            }
            else if (!inSampleCodeBlock && line.StartsWith("@code"))
            {
                razorCodeBlockStartingIndex = i;
                break;
            }

            if (razorBlockNesting == 0 && !inSampleCodeBlock)
            {
                markdownLines[i] = line.Replace("@", "@@"); // Sanitize `@` character for Razor compatibility
            }
        }

        if (razorCodeBlockStartingIndex > -1)
        {
            razorCodeBlockContent = string.Join(Environment.NewLine, markdownLines.Skip(razorCodeBlockStartingIndex));
            markdownLines = markdownLines.Take(razorCodeBlockStartingIndex).ToList();
        }

        string postContent = Markdown.ToHtml(string.Join(Environment.NewLine, markdownLines), Resources.Pipeline);
        
        if (razorCodeBlockContent is not null)
        {
            postContent += Environment.NewLine + Environment.NewLine + razorCodeBlockContent;
        }

        var yamlData = GetYamlData(yaml);

        var urlPath = $"/post/{publishedDate.Year}/{publishedDate.Month}/{publishedDate.Day}/{fileName}";

        var title = yamlData.GetValueOrDefault("title", "Untitled").Trim('"');
        var subTitle = yamlData.GetValueOrDefault("subtitle", string.Empty).Trim('"');
        var authorName = yamlData.GetValueOrDefault("author", string.Empty).Trim('"');
        var layout = yamlData.GetValueOrDefault("layout", "post").Trim('"');

        var templateKey = templates.Keys
                              .FirstOrDefault(k =>
                                  k.Equals($"{layout}template.razor", StringComparison.OrdinalIgnoreCase))
                          ?? "PostTemplate.razor";
        var templateContent = templates[templateKey];

        if (string.IsNullOrWhiteSpace(templateContent)) return null; // Skip if template content is empty

        // Replace placeholders in the template with actual values
        templateContent = templateContent
            .Replace("@*TITLE*@", title)
            .Replace("@*SUBTITLE*@", subTitle)
            .Replace("@*CONTENT*@", postContent)
            .Replace("@*PUBLISHED_DATE_yyyy-MM-ddTHH:mm:ssZ*@", publishedDate.ToString("yyyy-MM-ddTHH:mm:ssZ"))
            .Replace("@*PUBLISHED_DATE_MMM dd, yyyy*@", publishedDate.ToString("MMM dd, yyyy"))
            .Replace("@*AUTHOR*@", authorName)
            .Replace("@*URL*@", urlPath);

        return new PostMetaData(title, subTitle, urlPath, publishedDate, authorName, templateContent);
    }

    public static string? GeneratePage(string fileName, string content, Dictionary<string, string> templates,
        CancellationToken cancellationToken)
    {
        // Extract YAML front-matter using regex
        var match = Resources.FileRegex.Match(content);
        if (!match.Success) throw new ArgumentException("Content does not contain valid YAML front-matter.");
        var yaml = match.Groups[1].Value;
        string pageContent = Markdown.ToHtml(match.Groups[2].Value, Resources.Pipeline);
        var yamlData = GetYamlData(yaml);
        var urlPath = fileName == "index" ? "/" : fileName;

        var title = yamlData.GetValueOrDefault("title", "Untitled").Trim('"');
        var navOrder = yamlData.GetValueOrDefault("navorder", "0").Trim('"');
        var layout = yamlData.GetValueOrDefault("layout", "page").Trim('"');

        var templateKey = templates.Keys
                              .FirstOrDefault(k =>
                                  k.Equals($"{layout}template.razor", StringComparison.OrdinalIgnoreCase))
                          ?? "PageTemplate.razor";
        var templateContent = templates[templateKey];
        if (string.IsNullOrWhiteSpace(templateContent)) return null; // Skip if template content is empty

        // Replace placeholders in the template with actual values
        templateContent = templateContent
            .Replace("@*TITLE*@", title)
            .Replace("@*CONTENT*@", pageContent)
            .Replace("@*NAV_ORDER*@", navOrder)
            .Replace("@*URL*@", urlPath);
        return templateContent;
    }

    private static Dictionary<string, string> GetYamlData(string yaml)
    {
        var yamlData = new Dictionary<string, string>();
        // Parse YAML front-matter into a dictionary
        foreach (var line in yaml.Split(['\n', '\r'], StringSplitOptions.RemoveEmptyEntries))
        {
            var keyValue = line.Split([':'], 2);
            if (keyValue.Length == 2)
            {
                var key = keyValue[0].Trim();
                var value = keyValue[1].Trim();
                yamlData[key] = value;
            }
        }

        return yamlData;
    }
}