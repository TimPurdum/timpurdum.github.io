namespace TimPurdum.Dev.BlogConverter;

public static class Directories
{
    public static void Initialize(string projectPath)
    {
        Project = projectPath;
    }
    
    public static string Project = "";
    public static string Content => Path.Combine(Project, "Content");
    public static string ContentPosts => Path.Combine(Content, "Posts");
    public static string ContentPages => Path.Combine(Content, "Pages");
    public static string Templates => Path.Combine(Project, "Templates");
    public static string OutputPosts => Path.Combine(Project, "Pages", "Posts");
    public static string OutputPages => Path.Combine(Project, "Pages", "Pages");
}