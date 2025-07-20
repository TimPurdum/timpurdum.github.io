namespace TimPurdum.Dev.BlogCreator;

public static class Directories
{
    static Directories()
    {
        string currentDirectory = Directory.GetCurrentDirectory();
        if (currentDirectory.Contains("bin"))
        {
            currentDirectory = currentDirectory.Split("bin")[0].TrimEnd(Path.DirectorySeparatorChar);
        }
        Project = currentDirectory;
    }
    
    public static void Initialize(string blogProjectPath) 
    {
        BlogProject = blogProjectPath;
    }
    
    public static readonly string Project;
    public static string BlogProject = "";
    public static string Content => Path.Combine(Project, "Content");
    public static string ContentPosts => Path.Combine(Content, "Posts");
    public static string ContentPages => Path.Combine(Content, "Pages");
    public static string Templates => Path.Combine(Project, "Templates");
    public static string OutputWebRoot => Path.Combine(BlogProject, "wwwroot");
    public static string OutputBlogComponents => Path.Combine(BlogProject, "Components");
}