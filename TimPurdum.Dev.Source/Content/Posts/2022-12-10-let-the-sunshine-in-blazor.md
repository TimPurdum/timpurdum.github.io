---
layout: post
title: "Let the Sunshine In"
subtitle: "Finding Your Daylight with GeoBlazor"
lastmodified: "2025-11-02 17:43:38"
---
[*Originally posted on the dymaptic blog on 12/9/22*](https://www.dymaptic.com/let-the-sunshine-in-blazor/)

Here in the Northern Hemisphere, we are rapidly approaching the Winter Solstice, also known as the shortest day of the year. Yet sunshine is crucial to human wellbeing. Want to know how to find out when the sun rises and set in your location? We can build a Blazor application that shows the Day/Night Terminator, which is a shadow graphic laid on top of a map that shows exactly where the line is between day and night for any given date and time. 

*Let’s build a simple Day/Night Terminator web application with Asp.NET Core Blazor and GeoBlazor!*

![Graphic of a world map with day/night terminator line, overlaid with a sun and moon icon.](/images/Advent-2022-White-300x284.jpg){:style="display:block; margin-left:auto; margin-right:auto"}

[Get the Full Source Code on GitHub](https://github.com/dymaptic/GeoBlazor-Samples/SolarTracker)

[See the Live Demo](https://advent2022.geoblazor.com/)

## Getting Started

First, make sure you have the [.NET 7 SDK]([Download .NET (Linux, macOS, and Windows) (microsoft.com)](https://dotnet.microsoft.com/en-us/download)) installed on your computer. Now, open up a command prompt (Cmd, Bash, PowerShell, Windows Terminal), navigate to where you like to store code, and type `dotnet new blazorwasm-empty -o SolarTracker`. This will create a new empty Blazor WebAssembly (wasm) project named `SolarTracker` inside a folder of the same name. Navigate into the folder with `cd SolarTracker`, and type `dotnet run` to see your `Hello World`.

## Add GeoBlazor

Hit `Ctrl-C` to stop your application, then type `dotnet add package dymaptic.GeoBlazor.Core`. This will import the free and Open-Source [GeoBlazor](https://www.geoblazor.com) package into your project.

To complete this quest, you will also need to sign up for a free ArcGIS Developer account at https://developers.arcgis.com/sign-up/. Once you create this account, head to https://developers.arcgis.com/api-keys/, and click `New API Key`. Give it a title like `Solar Tracker`, and copy down the generated token.

Now it's time to fire up your favorite IDE and open your SolarTracker project. Inside, create a new file called `appsettings.json` inside the `wwwroot` folder. If you're familiar with Asp.NET Core, you know this is a configuration file. However, by default Blazor WASM doesn't include this file. Paste your ArcGIS API key into the file with the key "ArcGISApiKey".

```json
{
    "ArcGISApiKey": "PASTE_YOUR_KEY_HERE"
}
```

Let's add some references to make GeoBlazor work. In `wwwroot/index.html`, add the following three lines to the `head` tag. (The third line should already be there, just un-comment it).

```html
<link href="_content/dymaptic.GeoBlazor.Core"/>
<link href="_content/dymaptic.GeoBlazor.Core/assets/esri/themes/light/main.css" rel="stylesheet" />
<link href="SolarTracker.styles.css" rel="stylesheet" />
```

Next, open up `_Imports.razor`, and let's add some `@using` statements to make sure we have access to the GeoBlazor types.

```csharp
@using dymaptic.GeoBlazor.Core.Components
@using dymaptic.GeoBlazor.Core.Components.Geometries
@using dymaptic.GeoBlazor.Core.Components.Layers
@using dymaptic.GeoBlazor.Core.Components.Popups
@using dymaptic.GeoBlazor.Core.Components.Symbols
@using dymaptic.GeoBlazor.Core.Components.Views
@using dymaptic.GeoBlazor.Core.Components.Widgets
@using dymaptic.GeoBlazor.Core.Model
@using dymaptic.GeoBlazor.Core.Objects
```

Finally, open `Program.cs` and add the following line to import the GeoBlazor "services".

```csharp
builder.Services.AddGeoBlazor()
```

## Add a Map to your Blazor Page

Now to see the reason for all these imports! Let's open `Pages/Imports.razor`. Delete the `Hello World` and add the following.

```html
<MapView Style="height: 600px; width: 100%;" Zoom="1.5">
    <Map ArcGISDefaultBasemap="arcgis-streets">
        <GraphicsLayer />
    </Map>
    <LocateWidget Position="OverlayPosition.TopLeft" />
    <SearchWidget Position="OverlayPosition.TopRight" />
</MapView>
```

Run your application again, and you should see a world map! 

![Simple Map with Search](/images/simple_map_with_search.png)

Go ahead and play around with the`Locate` and `Search` widgets. Notice that when using either one, there will be a nice dot added to the map to show the location of your device or the search result.

![Map with Search Point](/images/map_with_point.png)

## Calculate and Draw the Day / Night Terminator 

We want to create an interactive graphic that shows where the line is between day and night, so we can figure out when the sun will rise and set. Add the following methods inside a `@code { }` block at the bottom of `Index.razor`.

```csharp
private async Task OnMapRendered()
{
    // generate the night-time shadow graphic, and store it in _polygon
    await CreateTerminator();
    await _graphicsLayer!.Add(new Graphic(_polygon!)
    {
        // this constructor will throw a compile-time warning, 
        // which is safe to ignore and will be fixed in a future 
        // version of GeoBlazor
        Symbol = new SimpleFillSymbol
        {
            FillStyle = FillStyle.Solid,
            Color = new MapColor(0, 0, 0, 0.3),
            Outline = new Outline
            {
                Color = new MapColor(0, 0, 0, 0)
            }
        }
    });
}

private MapView? _mapView;
private GraphicsLayer? _graphicsLayer;
private Polygon? _polygon;
private DateTime _selectedDateTime = DateTime.Now;
private TimeSpan _timeZoneOffset = TimeSpan.FromHours(-6);
private const double _k = Math.PI / 180;
```

We also need to hook up `MapView` and `GraphicsLayer` to the reference fields and the `OnMapRendered` Event Callback, and add an `@inject` reference at the top of the file.

```html
@page "/"
@inject Projection Projection

<MapView @ref="_mapView" OnMapRendered="OnMapRendered" ...>
    <Map ArcGISDefaultBasemap="arcgis-streets">
        <GraphicsLayer @ref="_graphicsLayer" />
    </Map>
    ...
```

The next bit I borrowed logic heavily from [midnight-commander by Jim Blaney](https://github.com/jgravois/midnight-commander/blob/master/js/SolarTerminator.js), who in turn used [Declination on Wikipedia](https://en.wikipedia.org/wiki/Declination) to build the calculations. Add the following two methods to your `@code` block.

```csharp
private async Task CreateTerminator()
{
    // clear out the graphics from previous runs
    foreach (var graphic in _graphicsLayer!.Graphics)
    {
        await _graphicsLayer.Remove(graphic);
    }

    int ordinalDay = _selectedDateTime.DayOfYear;
    
    double solarDeclination = -57.295779 * 
                              Math.Asin(0.397788 * 
                                        Math.Cos(0.017203 * 
                                                 (ordinalDay + 10) + 0.052465 * 
                                                 Math.Sin(0.017203 * (ordinalDay - 2))));
    
    SpatialReference spatialReference = (await _mapView!.GetSpatialReference())!;

    bool isWebMercator = spatialReference.Wkid is null ||
        (int)spatialReference.Wkid == 102100 ||
        (int)spatialReference.Wkid == 3857 ||
        (int)spatialReference.Wkid == 102113;
    
    double yMax = isWebMercator ? 85 : 90;
    double latitude = yMax * (solarDeclination > 0 ? -1 : 1);
    
    List<MapPath> rings = new();
    
    DateTime utcDateTime = _selectedDateTime.Subtract(_timeZoneOffset);

    for (double lon = -180; lon < 180; lon++)
    {
        MapPath path = new(new(lon + 1, latitude), 
                           new(lon, latitude), 
                           new(lon, 
                               GetLatitude(lon, solarDeclination, -yMax, yMax, utcDateTime)), 
                           new(lon + 1, 
                               GetLatitude(lon, solarDeclination, -yMax, yMax, utcDateTime)),
                           new(lon + 1, latitude));

        rings.Add(path);
    }

    _polygon = new Polygon(rings.ToArray(), SpatialReference.Wgs84);
    if (isWebMercator)
    {
        _polygon = (Polygon)(await Projection.Project(_polygon, SpatialReference.WebMercator))!;
    }
}

private double GetLatitude(double longitude, double solarDeclination, 
                           double yMin, double yMax, DateTime utcDateTime)
{
    double lt = utcDateTime.Hour + utcDateTime.Minute / 60.0 + utcDateTime.Second / 3600.0;
    double tau = 15 * (lt - 12);
    longitude += tau;
    double tanLat = -Math.Cos(longitude * _k) / Math.Tan(solarDeclination * _k);
    double arctanLat = Math.Atan(tanLat) / _k;
    return Math.Max(Math.Min(arctanLat, yMax), yMin);
}
```

Running your application now should show the Day/Night Terminator laid on top of the map!

![Day / Night Terminator](/images/DayNightTerminator.png)

## Control The Date and Time

Let's give our application some controls and a header. Right after the `@inject` line at the top, add the following.

```html
<h1>Day/Night Terminator</h1>

<div>
    <label>
    	Date:
        <input type="date" 
               value="@_selectedDateTime.ToString("yyyy-MM-dd")" 
               @onchange="UpdateDate" />
    </label> 
    <label>
        Time:
        <input style="width: 96px;" 
               type="time" 
               value="@_selectedDateTime.ToString("HH:mm")" 
               @onchange="UpdateTime" />
    </label>
</div>
```

In the `@code` block, add the new methods.

```csharp
private async Task UpdateDate(ChangeEventArgs arg)
{
    string[]? dateSegments = arg.Value?.ToString()?.Split('-');
    if (dateSegments is null || dateSegments.Length != 3) return;
    int year = int.Parse(dateSegments[0]);
    int month = int.Parse(dateSegments[1]);
    int day = int.Parse(dateSegments[2]);
    _selectedDateTime = new DateTime(year, month, day, 
                                     _selectedDateTime.Hour, 
                                     _selectedDateTime.Minute, 0);
    await OnMapRendered();
}

private async Task UpdateTime(ChangeEventArgs arg)
{
    string[]? timeSegments = arg.Value?.ToString()?.Split(':');
    if (timeSegments is null || timeSegments.Length < 2) return;
    int hour = int.Parse(timeSegments[0]);
    int minutes = int.Parse(timeSegments[1]);
    _selectedDateTime = new DateTime(_selectedDateTime.Year, 
                                     _selectedDateTime.Month, 
                                     _selectedDateTime.Day, hour, minutes, 0);
    await OnMapRendered();
}
```

Run the application, and you will be able to control the terminator graphic by changing the date/time. Try switching to a summer month, and notice the drastically different shadow!

### Winter

![Winter Terminator](/images/winterTerminator.png)

### Summer

![Summer Terminator](/images/summerTerminator.png)

You can now put in the date and time for any day you want, and the application will show you where the terminator sits. To find sunrise or sunset at your location, use the `Locate` or `Search` widget, then use the up/down arrow keys in the `Time` field to watch the shadow move, until the line is just on top of your point. Now you have a fun, interactive tool to track the sun, so don’t forget to go out and soak in some rays while you can! A more full-featured version of this tool is online at [advent2022.GeoBlazor.com](https://advent2022.geoblazor.com) and the code can be found on GitHub. You can get in touch with me at [tim.purdum@dymaptic.com](mailto:tim.purdum@dymaptic.com), [@TimPurdum@dotnet.social](https://dotnet.social/@TimPurdum) (Mastodon) or Join our Discord server. Ask [dymaptic](https://www.dymaptic.com) how we can help you with software or GIS. I hope you enjoyed the post and continue to enjoy the winter holiday season!


