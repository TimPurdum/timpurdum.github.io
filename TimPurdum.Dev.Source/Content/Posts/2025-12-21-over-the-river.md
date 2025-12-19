---
layout: post
title: "Over the River and Through the Woods"
subTitle: "Build a Navigation App with GeoBlazor and Blazor"
lastmodified: "2025-12-19 21:37:44"
---
# Over the River and Through the Woods: Build a Navigation App with GeoBlazor and Blazor

*C# Advent Calendar 2025*

It's that time of year again. The airports are packed, the highways are jammed, and everyone's trying to get somewhere—whether it's Grandma's house, a cozy cabin in the mountains, or anywhere that isn't the office. And what does every holiday traveler need? A good map.

In this post, I'll show you how to add interactive maps and GPS tracking to your Blazor applications using [GeoBlazor](https://www.geoblazor.com/)—a Blazor component library that wraps the powerful [ArcGIS JavaScript SDK](https://developers.arcgis.com/javascript/latest/api-reference/). We'll build a simple "find your way to Grandma's" navigation app, starting with the free GeoBlazor Core and then showing how [GeoBlazor Pro](https://docs.geoblazor.com/pages/upgradeToPro.html) can level up your app with continuous GPS tracking.

The best part? The same code works on web *and* mobile (via .NET MAUI Blazor Hybrid). Write once, navigate everywhere.

Let's pack our bags and hit the road!

---

## Packing for the Trip: Setting Up GeoBlazor

Before any road trip, you need to pack. For our mapping journey, that means setting up a new GeoBlazor project.

The easiest way to get started is with the [GeoBlazor project templates](https://www.nuget.org/packages/dymaptic.GeoBlazor.templates). Install them via the .NET CLI:

```bash
dotnet new install dymaptic.GeoBlazor.Templates
```

Now create your project:

```bash
dotnet new geoblazor -n GrandmaNavigator
```

This scaffolds a Blazor Web App project with GeoBlazor already configured for the [Interactive Server rendering mode](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/render-modes). The template sets up everything you need: package references, service registration, and a sample map page.

Before you can display maps, you'll need an ArcGIS API key. Head over to the [ArcGIS Developer Portal](https://developers.arcgis.com/) and sign up for a free account. Once you have your key, add it to `appsettings.json`:

```json
{
  "ArcGISApiKey": "your-arcgis-api-key-here"
}
```

If you're using GeoBlazor Pro (more on that later), you'll also need a registration key:

```json
{
  "ArcGISApiKey": "your-arcgis-api-key-here",
  "GeoBlazor": {
    "RegistrationKey": "your-geoblazor-pro-key-here"
  }
}
```

That's it—bags packed, we're ready to go!

---

## Starting the Journey: Your First Map

With GeoBlazor, adding a map to your Blazor app is as simple as adding a component. If you're familiar with Blazor's declarative syntax, this will feel right at home.

Open up a Razor page and add your first map:

```razor
@page "/navigate"

<MapView Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
    </Map>
</MapView>
```

```blazor-component us-map
<MapView Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
    </Map>
</MapView>
```

That's a full-screen map of the United States, centered and ready to explore. Let's break down what's happening:

- **`MapView`** is the main container component. It handles rendering, user interaction, and camera positioning. The `Longitude`, `Latitude`, and `Zoom` properties set the initial view.
- **`Map`** represents the map's data model—the layers, basemap, and other content.
- **`Basemap`** provides the background imagery. We're using `ArcGISNavigation`, which is perfect for turn-by-turn directions with its clean, road-focused design.

The component hierarchy mirrors how you'd think about a map: you have a *view* that displays a *map* that has a *basemap*. Simple and intuitive.

Run your app and you should see a beautiful, interactive map. Pan around, zoom in and out—it all just works.

> **Tip:** GeoBlazor also offers `SceneView` for 3D maps. If you want to see the terrain as you virtually fly to Grandma's house, just swap `MapView` for `SceneView` and add a `Tilt` property!

---

## Finding Your Destination: "Where to, Grandma's house?"

A map is nice, but we need to actually find where we're going. GeoBlazor includes a `SearchWidget` that lets users type an address and geocode it to coordinates.

Add the search widget inside your `MapView`:

```razor
<MapView Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
    </Map>

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
</MapView>

@code {
    private Point? _destination;

    private void OnDestinationSelected(SearchSelectResultEvent evt)
    {
        _destination = evt.Result?.Feature?.Geometry as Point;

        if (_destination is not null)
        {
            Console.WriteLine($"Destination set: {_destination.Latitude}, {_destination.Longitude}");
            // Grandma's house found!
        }
    }
}
```

```blazor-component add-search-widget
<MapView Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
    </Map>

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
</MapView>

@code {
    private Point? _destination;

    private void OnDestinationSelected(SearchSelectResultEvent evt)
    {
        _destination = evt.Result?.Feature?.Geometry as Point;

        if (_destination is not null)
        {
            Console.WriteLine($"Destination set: {_destination.Latitude}, {_destination.Longitude}");
            // Grandma's house found!
        }
    }
}
```

Type "123 Main Street, Anytown, USA" (or Grandma's actual address) and the widget will geocode it, drop a pin, and zoom the map to that location. The `OnSelectResult` event gives you access to the result, including the geographic coordinates.

Notice how GeoBlazor provides strongly-typed events. No need to parse JSON or deal with dynamic objects—you get `SearchSelectResultEvent` with all the data you need in a clean C# object.

---

## Are We There Yet? GPS Tracking

Now for the fun part—tracking your location as you make your way to Grandma's house. We'll look at two approaches: manual location updates with GeoBlazor Core (free), and continuous tracking with GeoBlazor Pro.

### Manual Location with GeoBlazor Core

GeoBlazor Core includes the `LocateWidget`, which finds the user's current location on demand. Think of it like pulling over to check the map—it works, but you have to do it manually. Currently, the event returns a JSON string, which you need to parse to get the location.

```razor
<MapView @ref="_mapView" 
         Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
    </Map>

    <LocateWidget @ref="_locateWidget"
                  Position="OverlayPosition.TopLeft"
                  OnLocate="OnUserLocated" />

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
</MapView>

<button class="update-location-btn" @onclick="UpdateMyLocation">
    Where Am I?
</button>

@code
{
    private LocateWidget? _locateWidget;
    private Point? _currentLocation;
    private Point? _destination;

    private async Task UpdateMyLocation()
    {
        if (_locateWidget is not null)
        {
            await _locateWidget.Locate();
        }
    }

    private async Task OnUserLocated(LocateEvent evt)
    {
        if (evt.Position is null)
        {
            return;
        }
        
        Position? position = JsonSerializer.Deserialize<Position>(evt.Position,
            JsonSerializerOptions.Web);

        if (position is null)
        {
            return;
        }
        _currentLocation = new Point(
            position.Coords.Longitude,
            position.Coords.Latitude);

        await _mapView!.GoTo([new Graphic(_currentLocation)]);

        Console.WriteLine($"You are here: {_currentLocation.Latitude}, {_currentLocation.Longitude}");

        // Check how far to Grandma's!
        if (_destination is not null)
        {
            // Calculate distance, update ETA, etc.
        }
    }

    private void OnDestinationSelected(SearchSelectResultEvent evt)
    {
        _destination = evt.Result?.Feature?.Geometry as Point;
    }
    
    private MapView? _mapView;
    private record Position(Coordinates Coords);
    private record Coordinates(double Latitude, double Longitude);
}
```

```blazor-component add-locate-widget
<MapView @ref="_mapView" 
         Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
    </Map>

    <LocateWidget @ref="_locateWidget"
                  Position="OverlayPosition.TopLeft"
                  OnLocate="OnUserLocated" />

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
</MapView>

<button style="margin: 1rem 0" @onclick="UpdateMyLocation">
    Where Am I?
</button>

@code
{
    private LocateWidget? _locateWidget;
    private Point? _currentLocation;
    private Point? _destination;

    private async Task UpdateMyLocation()
    {
        if (_locateWidget is not null)
        {
            await _locateWidget.Locate();
        }
    }

    private async Task OnUserLocated(LocateEvent evt)
    {
        if (evt.Position is null)
        {
            return;
        }
        
        Position? position = JsonSerializer.Deserialize<Position>(evt.Position,
            JsonSerializerOptions.Web);

        if (position is null)
        {
            return;
        }
        _currentLocation = new Point(
            position.Coords.Longitude,
            position.Coords.Latitude);

        await _mapView!.GoTo([new Graphic(_currentLocation)]);

        Console.WriteLine($"You are here: {_currentLocation.Latitude}, {_currentLocation.Longitude}");

        // Check how far to Grandma's!
        if (_destination is not null)
        {
            // Calculate distance, update ETA, etc.
        }
    }

    private void OnDestinationSelected(SearchSelectResultEvent evt)
    {
        _destination = evt.Result?.Feature?.Geometry as Point;
    }
    
    private MapView? _mapView;
    private record Position(Coordinates Coords);
    private record Coordinates(double Latitude, double Longitude);
}
```


Click the "Where Am I?" button and the map zooms to your current location. Simple, effective, and free with GeoBlazor Core.

This approach is great for:
- "Check-in" style updates
- Battery-conscious mobile apps
- Simple "where am I?" functionality

If you wanted to navigate between the two points, you could draw a GeoBlazor `Polyline Graphic` between them, but that would be a straight line "as the crow flies". Great for Santa's sleigh, not so much for the SUV. You could also add your own navigational data sets to generate `Polylines`.

Here's an example with pre-set start and stop points and a simple line drawn between. You can still update the start and stop points with the widgets.

```razor
<MapView @ref="_mapView" 
         Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4"
         OnLayerViewCreate="OnLayerViewCreated">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
        <GraphicsLayer @ref="_graphicsLayer" />
    </Map>

    <LocateWidget Position="OverlayPosition.TopLeft"
                  OnLocate="OnUserLocated" />

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
</MapView>

@code
{
    private async Task OnLayerViewCreated(LayerViewCreateEvent createEvent)
    {
        if (createEvent.Layer?.Id == _graphicsLayer?.Id)
        {
            await DrawGraphics();
        }
    }

    private async Task OnUserLocated(LocateEvent evt)
    {
        if (evt.Position is null)
        {
            return;
        }
        
        Position? position = JsonSerializer.Deserialize<Position>(evt.Position,
            JsonSerializerOptions.Web);

        if (position is null)
        {
            return;
        }
        _currentLocation = new Point(
            position.Coords.Longitude,
            position.Coords.Latitude);

        await _mapView!.GoTo([new Graphic(_currentLocation)]);

        _startPopup.Title = "Your Location";
        _startPopup.StringContent = $"You are here: {_currentLocation.Latitude}, {_currentLocation.Longitude}";

        // Check how far to Grandma's!
        _endPopup.Title = "Grandma's House";
        _endPopup.StringContent = $"Heading to here: {_destination.Latitude}, {_destination.Longitude}";

        await DrawGraphics();
    }

    private async Task DrawGraphics()
    {
        List<Graphic> graphics = [StartGraphic, EndGraphic, CrowGraphic];
        await _graphicsLayer!.Add(graphics);
        await _mapView!.GoTo(graphics);
        await _mapView!.OpenPopup(new PopupOpenOptions(Features: graphics.Take(2).ToList()));
    }

    private void OnDestinationSelected(SearchSelectResultEvent evt)
    {
        Console.WriteLine($"Destination: {JsonSerializer.Serialize(evt.Result?.Feature?.Geometry)}");
        _destination = (Point)evt.Result?.Feature?.Geometry!;
    }
    
    private MapView? _mapView;
    private GraphicsLayer? _graphicsLayer;
    // The Official Center of the World
    private Point _currentLocation = new(-114.7654397581329, 32.75036089381637);
    // North Pole, Alaska
    private Point _destination = new(-147.3537332080152, 64.75535610138833);
    private static readonly MapFont _font = new MapFont(24, "Noto Color Emoji");
    private static readonly TextSymbol _startSymbol = new("🌍", font: _font);
    private PopupTemplate _startPopup = new("The Official Center of the World",
        "<p><b>Felicity, California</b></p><p>Felicity is an unincorporated community in Imperial County, California.[1][2] The town was established in 1986 by Jacques-Andre Istel who bought the land in the 1950s and developed it in the 1980s after selling off his parachute business. The town is \"Dedicated to Remembrance\" and named for Istel's wife Felicia.[3] It is 2,600 acres and lies at an elevation of 285 feet (87 m).[1]</p><p>source: en.wikipedia.org/wiki/Felicity,_California</p>");

    private Graphic StartGraphic => new(_currentLocation, _startSymbol, _startPopup);
    private static readonly TextSymbol _endSymbol = new("💈", font: _font);
    private PopupTemplate _endPopup = new("North Pole, Alaska",
        "<p>North Pole is a small city in the Fairbanks North Star Borough, Alaska, United States. Incorporated in 1953, it is part of the Fairbanks metropolitan statistical area. As of the 2020 census, the city had a population of 2,243,[2] up from 2,117 in 2010.[3] Despite its name, the city is about 1,700 miles (2,700 km) south of Earth's geographic North Pole and 125 miles (201 km) south of the Arctic Circle.</p><p>source: en.wikipedia.org/wiki/North_Pole,_Alaska</p>");

    private Graphic EndGraphic => new(_destination, _endSymbol, _endPopup);
    Polyline CrowLine => new([
        [
            [_currentLocation.Longitude!.Value, _currentLocation.Latitude!.Value],
            [_destination.Longitude!.Value, _destination.Latitude!.Value]
        ]
    ], SpatialReference.Wgs84);
    SimpleLineSymbol _lineSymbol = new(new MapColor("red"),
        3, SimpleLineSymbolStyle.Dash);
    Graphic CrowGraphic => new(CrowLine, _lineSymbol);
    private record Position(Coordinates Coords);
    private record Coordinates(double Latitude, double Longitude);
}
```

```blazor-component crow-line
<MapView @ref="_mapView" 
         Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4"
         OnLayerViewCreate="OnLayerViewCreated">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
        <GraphicsLayer @ref="_graphicsLayer" />
    </Map>

    <LocateWidget Position="OverlayPosition.TopLeft"
                  OnLocate="OnUserLocated" />

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
</MapView>

@code
{
    private async Task OnLayerViewCreated(LayerViewCreateEvent createEvent)
    {
        if (createEvent.Layer?.Id == _graphicsLayer?.Id)
        {
            await DrawGraphics();
        }
    }

    private async Task OnUserLocated(LocateEvent evt)
    {
        if (evt.Position is null)
        {
            return;
        }
        
        Position? position = JsonSerializer.Deserialize<Position>(evt.Position,
            JsonSerializerOptions.Web);

        if (position is null)
        {
            return;
        }
        _currentLocation = new Point(
            position.Coords.Longitude,
            position.Coords.Latitude);

        await _mapView!.GoTo([new Graphic(_currentLocation)]);

        _startPopup.Title = "Your Location";
        _startPopup.StringContent = $"You are here: {_currentLocation.Latitude}, {_currentLocation.Longitude}";

        // Check how far to Grandma's!
        _endPopup.Title = "Grandma's House";
        _endPopup.StringContent = $"Heading to here: {_destination.Latitude}, {_destination.Longitude}";

        await DrawGraphics();
    }

    private async Task DrawGraphics()
    {
        List<Graphic> graphics = [StartGraphic, EndGraphic, CrowGraphic];
        await _graphicsLayer!.Add(graphics);
        await _mapView!.GoTo(graphics);
        await _mapView!.OpenPopup(new PopupOpenOptions(Features: graphics.Take(2).ToList()));
    }

    private void OnDestinationSelected(SearchSelectResultEvent evt)
    {
        Console.WriteLine($"Destination: {JsonSerializer.Serialize(evt.Result?.Feature?.Geometry)}");
        _destination = (Point)evt.Result?.Feature?.Geometry!;
    }
    
    private MapView? _mapView;
    private GraphicsLayer? _graphicsLayer;
    // The Official Center of the World
    private Point _currentLocation = new(-114.7654397581329, 32.75036089381637);
    // North Pole, Alaska
    private Point _destination = new(-147.3537332080152, 64.75535610138833);
    private static readonly MapFont _font = new MapFont(24, "Noto Color Emoji");
    private static readonly TextSymbol _startSymbol = new("🌍", font: _font);
    private PopupTemplate _startPopup = new("The Official Center of the World",
        "<p><b>Felicity, California</b></p><p>Felicity is an unincorporated community in Imperial County, California.[1][2] The town was established in 1986 by Jacques-Andre Istel who bought the land in the 1950s and developed it in the 1980s after selling off his parachute business. The town is \"Dedicated to Remembrance\" and named for Istel's wife Felicia.[3] It is 2,600 acres and lies at an elevation of 285 feet (87 m).[1]</p><p>source: en.wikipedia.org/wiki/Felicity,_California</p>");

    private Graphic StartGraphic => new(_currentLocation, _startSymbol, _startPopup);
    private static readonly TextSymbol _endSymbol = new("💈", font: _font);
    private PopupTemplate _endPopup = new("North Pole, Alaska",
        "<p>North Pole is a small city in the Fairbanks North Star Borough, Alaska, United States. Incorporated in 1953, it is part of the Fairbanks metropolitan statistical area. As of the 2020 census, the city had a population of 2,243,[2] up from 2,117 in 2010.[3] Despite its name, the city is about 1,700 miles (2,700 km) south of Earth's geographic North Pole and 125 miles (201 km) south of the Arctic Circle.</p><p>source: en.wikipedia.org/wiki/North_Pole,_Alaska</p>");

    private Graphic EndGraphic => new(_destination, _endSymbol, _endPopup);
    Polyline CrowLine => new([
        [
            [_currentLocation.Longitude!.Value, _currentLocation.Latitude!.Value],
            [_destination.Longitude!.Value, _destination.Latitude!.Value]
        ]
    ], SpatialReference.Wgs84);
    SimpleLineSymbol _lineSymbol = new(new MapColor("red"),
        3, SimpleLineSymbolStyle.Dash);
    Graphic CrowGraphic => new(CrowLine, _lineSymbol);
    private record Position(Coordinates Coords);
    private record Coordinates(double Latitude, double Longitude);
}
```

### Continuous Tracking with GeoBlazor Pro

If you want all that hands-free navigation like your car's GPS out of the box, GeoBlazor Pro adds the `TrackWidget`, which continuously monitors your location and updates the map as you move—no button pressing required.

To upgrade, first update your package reference:

```xml
<PackageReference Include="dymaptic.GeoBlazor.Pro" Version="4.3.0" />
```

Update your service registration in `Program.cs`:

```csharp
builder.Services.AddGeoBlazorPro(builder.Configuration);
```

Add the Pro imports to your `_Imports.razor`:

```razor
@using dymaptic.GeoBlazor.Pro
@using dymaptic.GeoBlazor.Pro.Components
@using dymaptic.GeoBlazor.Pro.Components.Layers
@using dymaptic.GeoBlazor.Pro.Components.Popups
@using dymaptic.GeoBlazor.Pro.Components.Symbols
@using dymaptic.GeoBlazor.Pro.Components.Widgets
```

Now replace `LocateWidget` with `TrackWidget`:

```razor
<MapView Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
    </Map>

    <TrackWidget @ref="_trackWidget"
                 Position="OverlayPosition.TopLeft"
                 OnTrack="OnLocationUpdate"
                 RotationEnabled="true"
                 Scale="500" />

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
</MapView>

@code {
    private TrackWidget? _trackWidget;
    private Point? _currentLocation;
    private Point? _destination;

    private void OnLocationUpdate(TrackEvent evt)
    {
        _currentLocation = new Point(
            evt.Position.Coords.Longitude,
            evt.Position.Coords.Latitude);

        // Automatically called as you move!
        Console.WriteLine($"Location update: {_currentLocation.Latitude}, {_currentLocation.Longitude}");
    }

    private void OnDestinationSelected(SearchSelectResultEvent evt)
    {
        _destination = evt.Result?.Feature?.Geometry as Point;
    }
}
```

```blazor-component pro-version
<MapView Class="map-view"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
    </Map>

    <TrackWidget @ref="_trackWidget"
                 Position="OverlayPosition.TopLeft"
                 OnTrack="OnLocationUpdate"
                 RotationEnabled="true"
                 Scale="500" />

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
</MapView>

@code {
    private TrackWidget? _trackWidget;
    private Point? _currentLocation;
    private Point? _destination;

    private void OnLocationUpdate(TrackEvent evt)
    {
        _currentLocation = new Point(
            evt.Position.Coords.Longitude,
            evt.Position.Coords.Latitude);

        // Automatically called as you move!
        Console.WriteLine($"Location update: {_currentLocation.Latitude}, {_currentLocation.Longitude}");
    }

    private void OnDestinationSelected(SearchSelectResultEvent evt)
    {
        _destination = evt.Result?.Feature?.Geometry as Point;
    }
}
```

Click on the Tracking Widget to have it start tracking you. The `TrackWidget` continuously fires `OnTrack` events as you move. Enable `RotationEnabled` and the map even rotates to match your heading—just like a real car GPS.

### Turn-by-Turn Directions with RouteService

Of course, real navigation needs actual driving directions—not just a straight line. GeoBlazor Pro includes the `RouteService`, which connects to ArcGIS routing services to calculate real road-based routes between points.

Here's how to get turn-by-turn directions from your current location to Grandma's house:

```razor
<MapView @ref="_mapView"
         Style="height: 100vh; width: 100%;"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4"
         OnLayerViewCreate="OnLayerViewCreated">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
        <GraphicsLayer @ref="_graphicsLayer" />
    </Map>

    <TrackWidget Position="OverlayPosition.TopLeft"
                 OnTrack="OnLocationUpdate"
                 RotationEnabled="true"
                 Scale="500" />

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
    <CustomOverlay Position="OverlayPosition.BottomLeft">
        @if (_directions.Any())
        {
            <div class="directions-panel">
                <h3>Directions to Grandma's House</h3>
                <ol>
                    @foreach (var step in _directions)
                    {
                        <li>@step</li>
                    }
                </ol>
            </div>
        }
    </CustomOverlay>
</MapView>

@code
{
    [Inject]
    public required RouteService RouteService { get; set; }
    
    private async Task OnLayerViewCreated(LayerViewCreateEvent createEvent)
    {
        if (createEvent.Layer?.Id == _graphicsLayer?.Id &&
            _currentLocation is not null && _destination is not null)
        {
            await GetDirections();
        }
    }

    private async Task OnLocationUpdate(TrackEvent evt)
    {
        _currentLocation = new Point(
            evt.Position.Coords.Longitude,
            evt.Position.Coords.Latitude);

        // Automatically called as you move!
        Console.WriteLine($"Location update: {_currentLocation.Latitude}, {_currentLocation.Longitude}");

        await GetDirections();
    }

    private async Task OnDestinationSelected(SearchSelectResultEvent evt)
    {
        _destination = evt.Result?.Feature?.Geometry as Point;
        await GetDirections();
    }

    private async Task GetDirections()
    {
        if (_currentLocation is null || _destination is null) return;

        // Configure route parameters
        var routeParams = new RouteParameters
        {
            FeatureSetStops = new FeatureSet
            {
                Features = [StartGraphic, EndGraphic]
            },
            ReturnDirections = true,
            OutSpatialReference = SpatialReference.Wgs84
        };

        // Solve the route
        RouteSolveResult result = await RouteService.Solve(
            "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World",
            routeParams);

        if (result.RouteResults?.FirstOrDefault() is { Route.Geometry: not null } routeResult)
        {
            // Draw the route on the map
            var routeGraphic = new Graphic(
                routeResult.Route.Geometry,
                _lineSymbol);

            await _graphicsLayer!.Add(routeGraphic);
            await _mapView!.GoTo([routeGraphic]);

            // Extract turn-by-turn directions
            _directions = routeResult.Directions?.Features?
                .Select(f => f.Attributes["text"]?.ToString() ?? "")
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList() ?? [];
        }
    }

    private MapView? _mapView;
    private GraphicsLayer? _graphicsLayer;
    private Point? _currentLocation;
    private Point? _destination;
    private static readonly MapFont _font = new(24, "Noto Color Emoji");
    private static readonly TextSymbol _startSymbol = new("🌍", font: _font);
    private PopupTemplate _startPopup = new("Your Location");

    private Graphic StartGraphic => new(_currentLocation, _startSymbol, _startPopup);
    private static readonly TextSymbol _endSymbol = new("💈", font: _font);
    private PopupTemplate _endPopup = new("Grandma's House");

    private Graphic EndGraphic => new(_destination, _endSymbol, _endPopup);
    SimpleLineSymbol _lineSymbol = new(new MapColor("red"),
        3, SimpleLineSymbolStyle.Dash);
    private List<string> _directions = [];
}
```

```blazor-component route-service
<MapView @ref="_mapView"
         Style="height: 100vh; width: 100%;"
         Longitude="-98.5795"
         Latitude="39.8283"
         Zoom="4"
         OnLayerViewCreate="OnLayerViewCreated">
    <Map>
        <Basemap>
            <BasemapStyle Name="BasemapStyleName.ArcgisNavigation" />
        </Basemap>
        <GraphicsLayer @ref="_graphicsLayer" />
    </Map>

    <TrackWidget Position="OverlayPosition.TopLeft"
                 OnTrack="OnLocationUpdate"
                 RotationEnabled="true"
                 Scale="500" />

    <SearchWidget Position="OverlayPosition.TopRight"
                  AllPlaceholder="Where to, Grandma's house?"
                  OnSelectResult="OnDestinationSelected" />
    <CustomOverlay Position="OverlayPosition.BottomLeft">
        @if (_directions.Any())
        {
            <div class="directions-panel">
                <h3>Directions to Grandma's House</h3>
                <ol>
                    @foreach (var step in _directions)
                    {
                        <li>@step</li>
                    }
                </ol>
            </div>
        }
    </CustomOverlay>
</MapView>

@code
{
    [Inject]
    public required RouteService RouteService { get; set; }
    
    private async Task OnLayerViewCreated(LayerViewCreateEvent createEvent)
    {
        if (createEvent.Layer?.Id == _graphicsLayer?.Id &&
            _currentLocation is not null && _destination is not null)
        {
            await GetDirections();
        }
    }

    private async Task OnLocationUpdate(TrackEvent evt)
    {
        _currentLocation = new Point(
            evt.Position.Coords.Longitude,
            evt.Position.Coords.Latitude);

        // Automatically called as you move!
        Console.WriteLine($"Location update: {_currentLocation.Latitude}, {_currentLocation.Longitude}");

        await GetDirections();
    }

    private async Task OnDestinationSelected(SearchSelectResultEvent evt)
    {
        _destination = evt.Result?.Feature?.Geometry as Point;
        await GetDirections();
    }

    private async Task GetDirections()
    {
        if (_currentLocation is null || _destination is null) return;

        // Configure route parameters
        var routeParams = new RouteParameters
        {
            FeatureSetStops = new FeatureSet
            {
                Features = [StartGraphic, EndGraphic]
            },
            ReturnDirections = true,
            OutSpatialReference = SpatialReference.Wgs84
        };

        // Solve the route
        RouteSolveResult result = await RouteService.Solve(
            "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World",
            routeParams);

        if (result.RouteResults?.FirstOrDefault() is { Route.Geometry: not null } routeResult)
        {
            // Draw the route on the map
            var routeGraphic = new Graphic(
                routeResult.Route.Geometry,
                _lineSymbol);

            await _graphicsLayer!.Add(routeGraphic);
            await _mapView!.GoTo([routeGraphic]);

            // Extract turn-by-turn directions
            _directions = routeResult.Directions?.Features?
                .Select(f => f.Attributes["text"]?.ToString() ?? "")
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList() ?? [];
        }
    }

    private MapView? _mapView;
    private GraphicsLayer? _graphicsLayer;
    private Point? _currentLocation;
    private Point? _destination;
    private static readonly MapFont _font = new(24, "Noto Color Emoji");
    private static readonly TextSymbol _startSymbol = new("🌍", font: _font);
    private PopupTemplate _startPopup = new("Your Location");

    private Graphic StartGraphic => new(_currentLocation, _startSymbol, _startPopup);
    private static readonly TextSymbol _endSymbol = new("💈", font: _font);
    private PopupTemplate _endPopup = new("Grandma's House");

    private Graphic EndGraphic => new(_destination, _endSymbol, _endPopup);
    SimpleLineSymbol _lineSymbol = new(new MapColor("red"),
        3, SimpleLineSymbolStyle.Dash);
    private List<string> _directions = [];
}
```

The `RouteService.Solve()` method takes a routing service URL and parameters, then returns the optimal route along with turn-by-turn directions. The route geometry can be displayed as a `Graphic` on the map, giving users a clear visual path to follow.

Key features of `RouteService`:
- **Real road routing** — Follows actual roads, not straight lines
- **Turn-by-turn directions** — Get text instructions for each maneuver
- **Multiple stops** — Plan routes with waypoints (stop for gas, pick up Aunt Martha)
- **Travel modes** — Configure for driving, walking, or trucking
- **Traffic awareness** — Factor in current traffic conditions for accurate ETAs

### Which Should You Choose?

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Core (LocateWidget)</th>
      <th>Pro (TrackWidget)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>One-time location</td>
      <td>Yes</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>Continuous tracking</td>
      <td>Manual button</td>
      <td>Automatic</td>
    </tr>
    <tr>
      <td>Map rotation</td>
      <td>No</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>Heading direction</td>
      <td>No</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>Price</td>
      <td>Free</td>
      <td>Licensed</td>
    </tr>
    <tr>
      <td>Best for</td>
      <td>Simple apps</td>
      <td>Navigation apps</td>
    </tr>
  </tbody>
</table>

For a holiday trip tracker, GeoBlazor Pro's continuous tracking makes all the difference. But if you're just building a simple "store locator" or want to keep costs down, GeoBlazor Core has you covered.


## Arriving Home: Conclusion

We've built a holiday navigation app with GeoBlazor! Here's what we covered:

1. **Setup** — Install the GeoBlazor template and configure your API key
2. **Maps** — Add an interactive map with just a few lines of declarative Razor markup
3. **Search** — Let users find addresses with the built-in `SearchWidget`
4. **GPS** — Track location manually with `LocateWidget` (Core) or continuously with `TrackWidget` (Pro)
5. **Dark Mode** — Easy theme switching for night driving

The full AutoNav sample application that inspired this post is [available on GitHub](https://github.com/dymaptic/GeoBlazor.Samples). It includes routing, turn-by-turn directions, and cross-platform support for both web and mobile (MAUI Hybrid).

### Resources

- [GeoBlazor Documentation](https://docs.geoblazor.com)
- [ArcGIS Developer Portal](https://developers.arcgis.com) — Get your free API key
- [GeoBlazor GitHub](https://github.com/dymaptic/GeoBlazor)
- [C# Advent Calendar](https://csadvent.christmas)

Whether you're building a full turn-by-turn navigation app or just want to show users where the nearest coffee shop is, GeoBlazor makes it easy to add rich mapping capabilities to your Blazor applications.

Now go ahead—fire up that app and get everyone home safely for the holidays!

*Happy travels and happy coding!*

---

*This post is part of the [C# Advent Calendar 2025](https://csadvent.christmas). Check out all the other great posts from the community!*


North Pole icon Designed by [Wannapik](https://www.wannapik.com/vectors/34723?search%5Btype%5D=Vector)








