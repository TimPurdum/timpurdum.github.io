---
layout: post
title: "Using ESBuild with Blazor"
subtitle: "How to Bundle JavaScript packages and Compile TypeScript for your Blazor project"
lastmodified: "2025-11-02 17:43:38"
---
[Originally posted on the dymaptic blog on April 21, 2023](https://blog.dymaptic.com/using-esbuild-with-blazor)

With Blazor, .NET developers can create fully-featured client or server web applications using only C#, HTML, and CSS. But Blazor developers can also access any JavaScript libraries, as I discussed in [Using ObjectReferences to Embed a JavaScript Text Editor in Blazor](https://blog.dymaptic.com/using-objectreferences-to-embed-a-javascript-text-editor-in-blazor). In that example, we referenced the JS library via a `script` tag from a CDN, but it is also possible to use NPM and import packages into your Blazor application using a build tool like [ESBuild](https://esbuild.github.io/).

ESBuild also provides a simple path to compile TypeScript into JavaScript, which means .NET developers used to statically-typed languages like C# can enjoy the same static typing benefits in their JavaScript code. While Microsoft does offer a [Nuget package to compile TypeScript](https://learn.microsoft.com/en-us/visualstudio/javascript/compile-typescript-code-nuget?view=vs-2022), this does not support the bundling mentioned above, so if you want to do both, you should use a tool like ESBuild.

[Get the Full Source Code Sample](https://github.com/dymaptic/dy-esbuild-sample)

![ESBuild allows you to construct a new project with TypeScript and Blazor](/images/Using-ESBuild-with-Blazor-1.webp)

## Getting Started

First, you need to [download and install npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), which is the JavaScript package manager used to install ESBuild and other resources. Next, from your Blazor project folder, open a terminal window and run the following commands. We will use the npm package [litepicker](https://litepicker.com/), a drop-down date range selector component, as an example to bundle into our application for this demonstration.

```bash
npm install esbuild
npm install litepicker
```

## Setting Up the Sample Component

In that same folder, create a new subfolder called `Scripts`, and a new file called `components.ts`. This is where we will add our own logic to set up the litepicker and call from C#.

```typescript
import Litepicker from "litepicker";
import 'litepicker/dist/plugins/ranges';

export function createDateRangePicker(element: HTMLElement,
    dotNetRef: any,
    startDate: string | null,
    endDate: string | null,
    minDate: string,
    maxDate: string,
    minYear: number,
    maxYear: number): Litepicker | null {
    try {        
        const picker = new Litepicker({
            element: element,
            startDate: startDate ?? undefined,
            endDate: endDate ?? undefined,
            firstDay: 0,
            numberOfColumns: 2,
            numberOfMonths: 2,
            switchingMonths: 1,
            resetButton: true,
            singleMode: false,
            minDate: minDate,
            maxDate: maxDate,
            dropdowns: { 
                "minYear": minYear, 
                "maxYear": maxYear, 
                "months": true, 
                "years": true },
            plugins: ['ranges']
        });

        picker.on("selected",
            async (startDate: Date, endDate: Date) => {
                await dotNetRef.invokeMethodAsync("JsDateRangeSelected",
                    startDate.toDateString(),
                    endDate.toDateString());
            });
        return picker;
    } catch (error) {
        console.log(error);
        return null;
    }
}
```

Now let's create a Razor Component class that wraps this logic into .NET.

### DateRangePicker.razor

```html
@inject IJSRuntime JsRuntime
<div>
    <div class="date-range-picker" @onclick="TogglePicker" attributes="AdditionalAttributes">
        <i class="material-icons">today</i> 
        @StartDate?.ToString(DisplayFormat) - @EndDate?.ToString(DisplayFormat)
    </div>
    <div @ref="_container" />
</div>
```
```csharp
@code {
    [Parameter(CaptureUnmatchedValues = true)]
    public IDictionary<string, object>? AdditionalAttributes { get; set; }

    [Parameter]
    public DateOnly? StartDate { get; set; } = 
        DateOnly.FromDateTime(DateTime.Now).AddMonths(-1);

    [Parameter]
    public DateOnly? EndDate { get; set; } = 
        DateOnly.FromDateTime(DateTime.Now);

    [Parameter]
    public EventCallback DateRangeSelected { get; set; }

    [Parameter]
    public string DisplayFormat { get; set; } = "MMM d, yyyy";

    [Parameter]
    public DateOnly MaxDate { get; set; } = new(2050, 1, 1);

    [Parameter]
    public DateOnly MinDate { get; set; } = new(2000, 1, 1);

    public async Task<DateRange?> GetDateRange()
    {
        DateOnly? startDate = await _litePicker!.InvokeAsync<DateOnly?>("getStartDate");
        DateOnly? endDate = await _litePicker!.InvokeAsync<DateOnly?>("getEndDate");
        if (startDate is null || endDate is null) return null;

        return new DateRange(startDate.Value, endDate.Value);
    }

    public async Task Clear()
    {
        await _litePicker!.InvokeVoidAsync("clearSelection");
    }

    [JSInvokable]
    public async Task JsDateRangeSelected(string startDateString, string endDateString)
    {
        Console.WriteLine($"Start Date: {startDateString}, End Date: {endDateString}");
        StartDate = DateOnly.Parse(startDateString);
        EndDate = DateOnly.Parse(endDateString);
        await DateRangeSelected.InvokeAsync(new DateRange(StartDate!.Value, EndDate!.Value));
    }

    protected override async Task OnParametersSetAsync()
    {
        if (_litePicker is not null)
        {
            await _litePicker.InvokeVoidAsync("setStartDate", StartDate);
            await _litePicker.InvokeVoidAsync("setEndDate", EndDate);
        }
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (_litePicker is null)
        {
            try
            {
                IJSObjectReference module =
                    await JsRuntime.InvokeAsync<IJSObjectReference>("import", "./js/components.js");
                _litePicker = 
                    await module.InvokeAsync<IJSObjectReference>("createDateRangePicker", _container,
                    DotNetObjectRef, StartDate, EndDate, MinDate, MaxDate, MinDate.Year, MaxDate.Year);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
    }

    private async Task TogglePicker()
    {
        if (_open)
        {
            await _litePicker!.InvokeVoidAsync("hide");
        }
        else
        {
            await _litePicker!.InvokeVoidAsync("show");
        }

        _open = !_open;
    }

    private ElementReference _container;
    private IJSObjectReference? _litePicker;
    private DotNetObjectReference<DateRangePicker> DotNetObjectRef => 
        DotNetObjectReference.Create(this);
    private bool _open;
    
    public record DateRange(DateOnly StartDate, DateOnly EndDate);
}
```

### DateRangePicker.razor.css

```css
.date-range-picker {
    border: 1px solid black;
    cursor: pointer;
    font-size: 1rem;
    height: 2.25rem;
    line-height: 2rem;
    min-width: 12rem;
    padding: 0 0.25rem;
}
```

### Index.razor

```html
<DateRangePicker />
```

Note that although we created a TypeScript file `components.ts`, the module import reference in this component is to `./js/components.js`. This is where ESBuild will come in, to transpile (convert from TypeScript to JavaScript) and bundle the litepicker npm package and our own code into a new minimized and bundled JavaScript file.

## Bundling and Transpiling

When you ran `npm install` previously, it created a JSON file in your directory called `package.json`. Open this file in an editor, and create or add to the scripts element the following lines.

```json
    "scripts": {
        "debugBuild": "esbuild ./Scripts/components.ts --format=esm --bundle --sourcemap --outdir=wwwroot/js",
        "releaseBuild": "esbuild ./Scripts/components.ts --format=esm --bundle --sourcemap --minify --outdir=wwwroot/js"
    },
```

These two scripts are nearly identical, with the exception of calling `--minify` on a release build, which makes the file smaller and more portable, but harder to inspect. You may also remove the `--sourcemap` option from the release build, if you don't want to support debugging the original TypeScript files in the browser in release mode.

To test ESBuild, you can run these scripts from the command line with `npm run debugBuild` or `npm run releaseBuild`. Try that now and take a look at the generated JavaScript file inside the `wwwroot/js` folder.  In my testing, with this single component, the ESBuild step takes less than 100ms to complete!

## Automating the Build

Since we are building a .NET Blazor web application, we already have a build and run process, either from the command line like `dotnet run` or using our IDE. It would be a challenge to remember to separately trigger the ESBuild script every time we want to run our application. So we will tap into the extensibility of MSBuild and the project file. Open your project's `.csproj` file, and add the following elements.

```xml
    <Target Name="NPM Install" AfterTargets="PreBuildEvent">
        <Exec Command="npm install" />
    </Target>
    
    <Target Name="NPM Debug Build" AfterTargets="NPM Install" Condition="$(Configuration) == 'DEBUG'">
        <Exec Command="npm run debugBuild" />
    </Target>
    
    <Target Name="NPM Release Build" AfterTargets="NPM Install" Condition="$(Configuration) == 'RELEASE'">
        <Exec Command="npm run releaseBuild" />
    </Target>
```

Run your .NET application now, and you should see the NPM commands and ESBuild script outputs directly in the build output window. When the application opens, test out the date range picker element. If you find any issues, check out the [full code sample on GitHub](https://github.com/dymaptic/dy-esbuild-sample), or leave a comment below. I will leave it to you to explore the parameter and callback bindings available in the `DateRangePicker`.

## ESBuild - A Simple Solution that Scales

Even though this sample only had a single, simple component, we have used [ESBuild](https://esbuild.github.io/) as the transpiler and bundler for [GeoBlazor](https://geoblazor.com/), a large-scale open-source library that provides a wrapper around the [ArcGIS Maps for JavaScript](https://developers.arcgis.com/javascript/latest/) library, allowing .NET developers to easily add interactive, custom mapping solutions to any website. ESBuild has easily scaled to be able to compile the large GeoBlazor and ArcGIS libraries into a single bundle, and is still fast and reliable at a much larger scale. If you have any questions about GeoBlazor or Blazor development, please reach out!
