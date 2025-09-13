using System.Reflection;
using System.Runtime;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Razor.Language;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CSharp.RuntimeBinder;
using Microsoft.JSInterop;

namespace TimPurdum.Dev.BlogGenerator.Compiler;

public static class RazorGenerator
{
    public static Type? GenerateRazorType(string fileName, string razorContent)
    {
        CreateRazorProjectEngine();
        var projectItem = new InMemoryRazorProjectItem(fileName, razorContent);
        var codeDocument = _projectEngine!.Process(projectItem);
        if (codeDocument.GetCSharpDocument().Diagnostics
                .Where(d => d.Severity == RazorDiagnosticSeverity.Error && d.Id != "RZ9992").ToArray() 
            is { Length: > 0 } diagnostics)
        {
            // Ignore "RZ9992: it doesn't like the script tags in the files
            var errors = diagnostics.Select(d => d.GetMessage()).ToList();
            
            throw new InvalidOperationException($"Razor compilation errors in {fileName}: {string.Join(", ", errors)}");
        }

        // Generate C# code
        var csharpCode = codeDocument.GetCSharpDocument().GeneratedCode;
        Console.WriteLine($"Generated C# code: {csharpCode}");

        // Compile with Roslyn
        var syntaxTree = CSharpSyntaxTree.ParseText(csharpCode, CSharpParseOptions.Default);
        var assemblyName = $"DynamicAssembly_{Guid.NewGuid():N}";

        var compilation = CSharpCompilation.Create(
            assemblyName,
            [syntaxTree],
            GetMetadataReferences(),
            new CSharpCompilationOptions(
                OutputKind.DynamicallyLinkedLibrary,
                optimizationLevel: OptimizationLevel.Debug,
                allowUnsafe: true
            )
        );
        
        // Emit assembly
        using var ms = new MemoryStream();
        var result = compilation.Emit(ms);

        if (!result.Success)
        {
            var errors = result.Diagnostics
                .Where(d => d.Severity == DiagnosticSeverity.Error)
                .Select(d => d.GetMessage())
                .ToList();

            var warnings = result.Diagnostics
                .Where(d => d.Severity == DiagnosticSeverity.Warning)
                .Select(d => d.GetMessage())
                .ToList();

            throw new InvalidOperationException($"Razor compilation failed for {fileName}: {string.Join(", ", errors)}{Environment.NewLine}{string.Join(Environment.NewLine, warnings)}");
        }

        ms.Seek(0, SeekOrigin.Begin);
        var assembly = Assembly.Load(ms.ToArray());
        return assembly.GetTypes()
            .FirstOrDefault(t => t.IsSubclassOf(typeof(ComponentBase)));
    }
    
    public static RazorProjectEngine CreateRazorProjectEngine()
    {
        if (_projectEngine is null)
        {
            var fileSystem = RazorProjectFileSystem.Create(Directory.GetCurrentDirectory());
            _projectEngine = RazorProjectEngine.Create(RazorConfiguration.Default, fileSystem, builder =>
            {
                builder.SetNamespace("DynamicComponents");
                builder.SetRootNamespace("DynamicComponents");
                builder.AddDefaultImports("@using TimPurdum.Dev.BlogGenerator.Compiler");
                builder.AddDefaultImports("@using TimPurdum.Dev.BlogGenerator.Shared");
                builder.AddDefaultImports("@using TimPurdum.Dev.BlogGenerator.Shared.AbstractTemplates");
                builder.AddDefaultImports("@using TimPurdum.Dev.BlogGenerator.Shared.DefaultImplementationTemplates");
                builder.AddDefaultImports("@using Microsoft.AspNetCore.Components");
                builder.AddDefaultImports("@using Microsoft.AspNetCore.Components.Web");
                builder.AddDefaultImports("@using Microsoft.JSInterop");
                builder.AddDefaultImports("@using System.Linq");
                builder.AddDefaultImports("@using System.Collections.Generic");
                builder.AddDefaultImports("@using System.Threading.Tasks");
                builder.AddDefaultImports("@using System.Text");
                builder.AddDefaultImports("@using static Microsoft.AspNetCore.Components.Web.RenderMode");
                builder.AddDefaultImports("@using Microsoft.AspNetCore.Components.Forms");
                builder.AddDefaultImports("@using Microsoft.AspNetCore.Components.Routing");
                builder.AddDefaultImports("@using Microsoft.AspNetCore.Components.Web.Virtualization");
            });
        }
        return _projectEngine;
    }
    
    private static List<MetadataReference> GetMetadataReferences()
    {
        List<MetadataReference> references =
        [
            MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
            MetadataReference.CreateFromFile(typeof(Console).Assembly.Location),
            MetadataReference.CreateFromFile(typeof(AssemblyTargetedPatchBandAttribute).Assembly.Location),
            MetadataReference.CreateFromFile(typeof(CSharpArgumentInfo).Assembly.Location),
            // Add Blazor references
            MetadataReference.CreateFromFile(typeof(ComponentBase).Assembly.Location),
            MetadataReference.CreateFromFile(typeof(ErrorBoundary).Assembly.Location),
            MetadataReference.CreateFromFile(typeof(IJSRuntime).Assembly.Location),
            MetadataReference.CreateFromFile(typeof(MarkupParser).Assembly.Location)
        ];

        // Add system references
        string[] systemAssemblies =
        [
            "System.Runtime",
            "System.Collections",
            "System.Linq",
            "System.Linq.Expressions",
            "System.ComponentModel",
            "System.ComponentModel.Annotations",
            "Microsoft.AspNetCore.Components",
            "Microsoft.AspNetCore.Components.Web",
            "TimPurdum.Dev.BlogGenerator.Compiler",
            "TimPurdum.Dev.BlogGenerator.Shared"
        ];

        foreach (var assemblyName in systemAssemblies)
            try
            {
                var assembly = Assembly.Load(assemblyName);
                references.Add(MetadataReference.CreateFromFile(assembly.Location));
            }
            catch
            {
                // Ignore missing assemblies
            }

        return references;
    }

    private static RazorProjectEngine? _projectEngine;
}