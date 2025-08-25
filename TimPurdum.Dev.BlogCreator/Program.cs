using TimPurdum.Dev.BlogCreator;

// set the path to the blog project
string blogPath = args.Length > 0 ? args[0] : "../TimPurdum.Dev";


Directories.Initialize(blogPath);

await Generator.GenerateSite();