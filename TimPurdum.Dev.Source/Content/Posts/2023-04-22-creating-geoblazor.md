---
layout: post
title: "Creating GeoBlazor"
subtitle: "How I started an open source library"
lastmodified: "2025-11-02 17:43:38"
---
[*Originally posted on the dymaptic blog on 3/2/23*](https://blog.dymaptic.com/creating-geoblazor-the-asp-net-core-web-mapping-library)

This is a story about how I came to build the [GeoBlazor](https://geoblazor.com) SDK and component library. In 2022 dymaptic invited me to attend my first [Esri Developer Summit](https://www.esri.com/en-us/about/events/devsummit/overview), where I learned all about the ArcGIS platform, SDKs, and services. ArcGIS is the leading enterprise Geospatial Information software service, used by private and public sector agencies around the world. The scope of both the conference and the software was impressive, and I learned a great deal in that week.

![A computer tablet and pen showing the making of GeoBlazor](/images/Creating-GeoBlazor.jpg){:style="display:block; margin-left:auto; margin-right:auto"}

While I was new to ArcGIS, I was already an experienced .NET software developer, with an especially keen interest in web development. I started off the conference by walking the exhibition hall, looking to learn all the different technologies available. I quickly found the [ArcGIS Runtime SDK for .NET](https://developers.arcgis.com/net/) (now called "ArcGIS Maps SDK for .NET"), which allows using ArcGIS on desktop and mobile applications, previously via Xamarin but now updated to [.NET MAUI](https://dotnet.microsoft.com/en-us/apps/maui). There were also SDKs for building add-ins to the ArcGIS Pro desktop application and the Unity game engine, both of which are built on .NET/C#.

I then went looking for web development options, and I found the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/latest/) (now rebranded to "ArcGIS MAPS SDK for JavaScript"). This tool allows embedding ArcGIS maps in any web application and is also the backbone of the other Esri web applications, such as [ArcGIS Online](https://www.esri.com/en-us/arcgis/products/arcgis-online/overview) and [ArcGIS Experience Builder](https://www.esri.com/en-us/arcgis/products/arcgis-experience-builder/overview).

I quickly noticed a "gap" in the Esri product offerings for developers. While .NET was obviously a core part of the Esri developer community, there was no way to run ArcGIS with Asp.NET Core web applications. All of the .NET solutions were geared toward on-device applications. Yet, I knew from my previous experience with [Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/?view=aspnetcore-7.0) that it was quite possible to call any JavaScript code from Blazor, and run such an application on an Asp.NET Core server, in WebAssembly on the client, or even embed it within a MAUI application. I started attending the JavaScript API sessions at the conference, and while listening, was also building a proof-of-concept Blazor application that simply called into the same JS samples that were being presented. This was the foundation of what would become GeoBlazor.

One early decision I made for GeoBlazor was to offer more than simply a 1-1 wrapper around ArcGIS. I decided that GeoBlazor should be component-first, like Blazor and many JS frameworks. Thus, I came up with a pattern of [Razor Components](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/?view=aspnetcore-7.0) that could be stacked together in HTML-based markup to build a map view.

```html
<MapView Longitude="-97.75188" Latitude="37.23308" Zoom="11" Style="height: 400px; width: 100%;"> 
    <WebMap>
        <PortalItem Id="4a6cb60ebbe3483a805999d481c2daa5" />
    </WebMap>
    <ScaleBarWidget Position="OverlayPosition.BottomLeft" />
</MapView>
```

Internally, Blazor is designed to render each Razor Component independently and iterates through components from the child up to the parent. It also is built to re-render any changes immediately. Translating these patterns into a JavaScript wrapper for ArcGIS was a development challenge. Even more challenging was returning state changes from JavaScript and user interaction back to the C# code. My article on [Using ObjectReferences to Embed a JavaScript Text Editor in Blazor](https://www.dymaptic.com/blazor-and-javascript-passing-object-references/) outlines some simple examples of how Blazor and JavaScript are kept in sync in GeoBlazor.

We recently released version 2.0.0 of GeoBlazor where we continue to build upon the early component-model concept with additional layer types, widgets, and other components. GeoBlazor now also offers more support for user interactions, such as click event handlers, hit tests (determine what graphics were clicked on), and feature querying. You can see our full set of sample pages at [https://samples.geoblazor.com](https://samples.geoblazor.com).
