---
layout: post
title: "Comparing Blazor Project Structure in .NET 7 and 8"
subtitle: "Understanding How to Set Up or Update a Complex Project"
---

.NET 8, which is currently a preview Release Candidate (RC2) and will be released fully next month, brings about vast changes in the structure of Asp.NET Core Blazor projects. ~~The goal behind these structural changes is to support, from a single project, the ability to render pages and components as static html, server-connected interactive, or WebAssembly-based client interactive.~~ **_UPDATE: Apparently, .NET 8 does NOT provide a single-project solution for Server and WebAssembly. Instead, in Visual Studio, if you select `Auto` or `WebAssembly` rendering, you get a second `.Client` project. If you create a template from the command line, there is no notification that this is the case, and so you can easily be misled into thinking you can do all the work in one project [(Source)](https://learn.microsoft.com/en-us/aspnet/core/blazor/project-structure?view=aspnetcore-8.0#blazor-web-app)._** Previously, when developing a project, one would have to choose between Blazor Server and Blazor WebAssembly, and static rendering was not an option.

The new goals are lofty and intriguing, but they come with a lot of challenges for current Blazor developers. The entire setup of a Blazor project has shifted, in both helpful and painful ways. First, I should say, they have not announced any plans to _deprecate_ any of the .NET 6/7 patterns. So if you leave your existing applications alone, they will continue to work on .NET 8. However, if you, like me, are constantly building complex applications that use shared Razor Class Libraries, combine Web APIs with Blazor, or any other pattern where you do not just click `File -> New Project`, it's important to understand these differences so that you can make informed decisions about your project structure.

## Project Settings / .csproj

We will start with looking at the project settings, which are in the `.csproj` file.

### .NET 6/7 Blazor Server .csproj

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
        <TargetFramework>net7.0</TargetFramework>
    </PropertyGroup>
</Project>
```

Blazor Server is very straight-forward, requiring no NuGet packages. The `.Web` SDK brings in all the Asp.NET Core libraries by default.

### .NET 6/7 Blazor WebAssembly .csproj

```xml
<Project Sdk="Microsoft.NET.Sdk.BlazorWebAssembly">
    <PropertyGroup>
        <TargetFramework>net7.0</TargetFramework>
    </PropertyGroup>

    <ItemGroup>
        <PackageReference Include="Microsoft.AspNetCore.Components.WebAssembly" Version="7.0.12" />
        <PackageReference Include="Microsoft.AspNetCore.Components.WebAssembly.DevServer" Version="7.0.12" PrivateAssets="all" />
    </ItemGroup>
</Project>
```

WebAssembly projects have a different SDK target than all other Asp.NET Core projects, `Microsoft.NET.Sdk.BlazorWebAssembly`. They also require specific NuGet references.

### .NET 8 Web App .csproj

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
        <TargetFramework>net8.0</TargetFramework>
    </PropertyGroup>

    <ItemGroup>
        <PackageReference Include="Microsoft.AspNetCore.Components.WebAssembly.Server" Version="8.0.0-rc.2.23480.2" />
    </ItemGroup>

</Project>
```

This is _almost_ the same as Blazor Server. However, if you want to include the ability to manually or automatically move components to WebAssembly, you need the new NuGet reference to `WebAssembly.Server`.

**UPDATE: The Blazor Web App `.Client` extension project is similar to the .NET 6/7 WebAssembly project. However, you don't need the `WebAssembly.DevServer` package.**

## Program.cs

Some of the biggest changes are in the startup code for your project.

### .NET 6/7 Blazor Server Program.cs

```csharp
...
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();
...

WebApplication app = builder.Build();
...

app.MapBlazorHub();
...

app.Run();
```

These are the basic lines that make Blazor Server work. We call `AddRazorPages` because Blazor server bootstraps itself on top of a Razor Page (`_Host.cshtml`). Then we explicitly call `AddServerSideBlazor`, and in the router, we `MapBlazorHub` to find all routable Razor Components (i.e., Blazor pages).

### .NET 6/7 Blazor WebAssembly Program.cs

```csharp
...
WebAssemblyHostBuilder builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");
...

await builder.Build().RunAsync();
```

Since the WebAssembly project is built around Blazor, it has a more straightforward hookup, where the `builder` object accepts `RootComponents` that are Razor Components.

### .NET 8 Blazor Web App Program.cs

```csharp
...
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();
...

WebApplication app = builder.Build();
...

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode();
...

app.Run();
```

The Blazor Web App startup includes all new extension methods on both `builder` and `app`. `AddRazorComponents` and `MapRazorComponents` are both required, but the `Interactive` methods are optional, and you select these based on which render modes you want to support. One positive improvement over Blazor Server is that we have removed the need to bootstrap from Razor Pages, and instead can directly map routes via the `App.razor` component.

**UPDATE: The .NET 8 Blazor Web App requires a `.Client` WebAssembly project, which has a very minimal `Program.cs`, seen below. You cannot use WebAssembly rendering from your main Blazor Web App project.**

```csharp
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

await builder.Build().RunAsync();
```

## Pages and Components

Pages and component differences are more involved to explain the differences. I will focus on what is actually different between versions. At the end, all versions of Blazor support routable Razor Components (Blazor Pages) and nested Razor Components.

### .NET 6/7 Blazor Server Pages/Components

#### _Host.cshtml

```csharp
@page "/"
@namespace Sample.Server
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
@{
    Layout = "_Layout";
}

<component type="typeof(App)" render-mode="ServerPrerendered"/>
```

`_Host.cshtml` is the root Razor Page that receives routing from the Asp.NET Core router. You can see how it calls `App` as a `component`.

#### _Layout.cshtml

```html
@using Microsoft.AspNetCore.Components.Web
@namespace Sample.Server
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers

<!DOCTYPE html>
<html lang="en">
    <head>
        ...

        <component type="typeof(HeadOutlet)" render-mode="ServerPrerendered" />
    </head>
    <body>
        @RenderBody()

        <div id="blazor-error-ui">
            <environment include="Staging,Production">
                An error has occurred. This application may no longer respond until reloaded.
            </environment>
            <environment include="Development">
                An unhandled exception has occurred. See browser dev tools for details.
            </environment>
            <a href="" class="reload">Reload</a>
            <a class="dismiss">🗙</a>
        </div>

        <script src="_framework/blazor.server.js"></script>
    </body>
</html>
```

`_Layout.cshtml` is the root html content that will be used by `_Host`, including the `<head>` tag and scripts. Note that `@RenderBody()` marks where the `_Host` content, and therefore its child components, will be rendered.

#### App.razor (Blazor Server)

```html
<Router AppAssembly="@typeof(App).Assembly">
    <Found Context="routeData">
        <RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
        <FocusOnNavigate RouteData="@routeData" Selector="h1" />
    </Found>
    <NotFound>
        <PageTitle>Not found</PageTitle>
        <LayoutView Layout="@typeof(MainLayout)">
            <p role="alert">Sorry, there's nothing at this address.</p>
        </LayoutView>
    </NotFound>
</Router>
```

This is the first "Blazor"/Razor Component. It manages routing within the Blazor pages. While the name and concept remains across all versions of Blazor, the implementation varies.

### .NET 6/7 Blazor WebAssembly Pages/Components

#### wwwroot/index.html

```html
<!DOCTYPE html>
<html lang="en">

<head>
    ...

</head>

<body>
<div id="app">Loading...</div>

<div id="blazor-error-ui">
    An unhandled error has occurred.
    <a class="reload" href="">Reload</a>
    <a class="dismiss">🗙</a>
</div>
<script src="_framework/blazor.webassembly.js"></script>
</body>

</html>
```

Since Blazor WebAssembly renders in the browser, it must start with pre-rendered html. The call to load the `blazor.webassembly.js` script is what kicks off all interactivity. The `<div id="app">` is the placeholder where `App.razor` will be rendered once the WebAssembly code is loaded.

#### App.razor (Blazor WebAssembly)

```html
<Router AppAssembly="@typeof(App).Assembly">
    <Found Context="routeData">
        <RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
        <FocusOnNavigate RouteData="@routeData" Selector="h1" />
    </Found>
    <NotFound>
        <PageTitle>Not found</PageTitle>
        <LayoutView Layout="@typeof(MainLayout)">
            <p role="alert">Sorry, there's nothing at this address.</p>
        </LayoutView>
    </NotFound>
</Router>
```

The `App.razor` in WebAssembly is identical in structure and function to the one in Blazor Server.

### .NET 8 Blazor Web App Pages/Components

As mentioned above, one of the nice features of Blazor Web Apps is the direct routing to Razor Components. `App.razor` now takes on the brunt of the html setup.

#### App.razor (Blazor Web App)

```html
<!DOCTYPE html>
<html lang="en">

    <head>
        ...

        <HeadOutlet @rendermode="@InteractiveAuto" />
    </head>

    <body>
        <Routes @rendermode="@InteractiveAuto" />
        <script src="_framework/blazor.web.js"></script>
    </body>

</html>
```

Two things to note here. First, `@rendermode`, which is optional, will set the render mode for all child pages and components. See [ASP.NET Core Blazor render modes](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/render-modes?view=aspnetcore-8.0) to learn more about these options. If you want the "old" behavior of Blazor Server in a Blazor Web App, you should be able to set  `@rendermode="InteractiveServer"`. (I am still testing this to see if it is really a 1-1 comparison). Also note that, _by default, if you don't set a render mode, Blazor Web Apps have no interactivity!_ This means that `EventCallbacks` and click handlers simply don't work, _by default_ in a Blazor Web App. The new default is completely statically-rendered server pages. In my opinion, this is the biggest failing of Blazor moving into .NET 8, as it undermines the _entire point_ of using Blazor for rich web development.

The second point of interest is that the bulk of the old `App.razor` functionality, namely routing, has been moved into a child component named `Routes`.

#### Routes.razor

```html
<Router AppAssembly="@typeof(Program).Assembly">
    <Found Context="routeData">
        <RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
        <FocusOnNavigate RouteData="@routeData" Selector="h1" />
    </Found>
</Router>
```

**UPDATE: The Blazor Web App `.Client` project has only the `Routes.razor` part of the structure described above, when targeting WebAssembly. The rest remains in the main project.**

## Sharing Components in Razor Class Libraries

One of my biggest frustrations with the new Blazor Web App is that it makes it much more difficult to reason about, and even share, Razor Components in a Razor Class Library. Especially with the pattern of defining the `@rendermode` _inside_ the component. Will Blazor Hybrid in MAUI ignore these declarations? What about a shared Blazor WebAssembly executable? Until I found the explanation above about how to set the render mode at the `App.razor` level, I wasn't even sure if you _could_ use previously-generated, routable components from a library.

One other catch. In .NET 6/7, this is how we told Blazor to find components from an RCL, in `App.razor`:

```html
<Router AppAssembly="@typeof(App).Assembly"
        AdditionalAssemblies="new[] { typeof(MyRclComponent).Assembly }">
...
```

This works for Blazor Server, Blazor WebAssembly, and Blazor Hybrid (MAUI). However, in Blazor Web Apps, you need to add the following line to `Program.cs`:

```csharp
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(MyRclComponent).Assembly);
```

## Looking Forward

I am still a huge fan of Asp.NET Core Blazor, and I think there were a lot of great improvements in .NET 8. While I am _very_ frustrated by the default behavior changing from interactive to static components, I hope that this will be better exposed and highlighted through IDE and compile-time warnings. For example, if I compile a Razor Component with `@onclick` handlers, and the compiler and/or IDE can tell it is referenced to be rendered statically, this should generate a warning, so I know that my handlers are not going to work.

I'm also concerned about managing user state in Blazor Web Apps. Rockford Lhotka published an [excellent blog post](https://blog.lhotka.net/2023/10/12/Blazor-8-State-Management) about this issue. Given the combination of user state and shared RCL code in most of my business projects, I am likely to stick with top-level `rendermode` set to `InteractiveServer` or `InteractiveWebAssembly` (assuming this works like current Wasm (**UPDATE: It doesn't, see other updates**)) for the foreseeable future, and rarely if ever use the complex mix of rendering modes now available. It will be interesting to see what .NET 9 brings. Hopefully, nothing near this year's complexity of changes!

**UPDATE: The discovery, by switching from command line to Visual Studio, of the required additional WebAssembly project makes .NET 8 Blazor Web Apps even _less_ appealing as the "new way". What, exactly, did we gain over the old patterns? Apparently just static rendering and first-class routing. And in return, we give up the clear paths of sharing code across projects. I'm not at all clear yet how I would set up a Blazor Web App that supports Server and WebAssembly rendering and also shares components with MAUI. Maybe it's not as hard as it seems, but as someone who reads _obsessively_ about Blazor, and attended MS Build last spring, I must say, the lack of clarity in the CLI tools and documentation are incredibly frustrating.**

Feel free to ping me on Mastodon [@TimPurdum@dotnet.social](https://dotnet.social/@TimPurdum) if you want to geek out about Blazor!