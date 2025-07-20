using System.Text.RegularExpressions;
using Markdig;

namespace TimPurdum.Dev.BlogCreator;

public static class Resources
{
    public static MarkdownPipeline Pipeline = new MarkdownPipelineBuilder()
        .UseAdvancedExtensions()
        .UseYamlFrontMatter()
        .Build();
    public static Regex FileRegex = new(@"^---\s*(.*?)\s*---\s*(.*)$", 
        RegexOptions.Compiled | RegexOptions.Singleline);
    public static Regex PostNameRegex = new(@"^(\d{4})-(\d{1,2})-(\d{1,2})-(?<fileName>.+)$",
        RegexOptions.Compiled | RegexOptions.Singleline);
}