using TimPurdum.Dev.BlogCreator;

// set the path to the blog project
Directories.Initialize(args[0]);

await Generator.GenerateSite();