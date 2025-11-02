---
layout: post
title: "30 Day Map Challenge: Day 1 - Points"
---

I decided to take part in the [30 Day Map Challenge](https://30daymapchallenge.com/) this year and show off some of 
the functionality of [GeoBlazor](https://geoblazor.com). Each day has a different theme, and today's theme is "Points".

Since food insecurity is a big issue in the United States right now, I decided to create an interactive map of food
pantries across the country. The data is sourced from [Feeding America](https://www.feedingamerica.org/), which has
tons of great resources for finding food assistance or contributing to the cause.

I layered this over an ArcGIS Online Living Atlas WebMap from the [PLACES](https://maps.arcgis.com/home/item.html?id=eb09c0c1a9eb4ad8afe0e0773d1c36a8)
program led by the CDC around the past census, which gives some context on food insecurities.

## Interactive Map of Food Pantries

```blazor-component food-bank-map
<MapView @ref="_mapView" 
         Class="map-view" 
         OnLayerViewCreate="OnLayerViewCreate">
    <WebMap>
        <PortalItem PortalItemId="eb09c0c1a9eb4ad8afe0e0773d1c36a8" />
        <FeatureLayer Source="@([])"
                      Title="Food Pantries"
                      OutFields="@(["*"])"
                      GeometryType="FeatureGeometryType.Point"
                      ObjectIdField="OrganizationID"
                      @ref="_featureLayer">
            <Field Name="OrganizationID" Alias="Organization ID" Type="FieldType.Integer" />
            <Field Name="FullName" Alias="Full Name" Type="FieldType.String" />
            <Field Name="Address1" Alias="Address 1" Type="FieldType.String" />
            <Field Name="Address2" Alias="Address 2" Type="FieldType.String" />
            <Field Name="City" Alias="City" Type="FieldType.String" />
            <Field Name="State" Alias="State" Type="FieldType.String" />
            <Field Name="Zip" Alias="Zip Code" Type="FieldType.String" />
            <Field Name="Phone" Alias="Phone" Type="FieldType.String" />
            <Field Name="URL" Alias="Website" Type="FieldType.String" />
            <Field Name="LogoUrl" Alias="Logo URL" Type="FieldType.String" />
            <PopupTemplate Title="<a target='_blank' href='{URL}'>{FullName}</a>"
                           OutFields="@(["*"])">
                <CustomPopupContent CreatorFunction="GenerateLogo"
                                    OutFields="@(["*"])"/>
                <FieldsPopupContent>
                    <FieldInfo FieldName="Address1" Label="Address 1"/>
                    <FieldInfo FieldName="Address2" Label="Address 2"/>
                    <FieldInfo FieldName="City" Label="City"/>
                    <FieldInfo FieldName="State" Label="State"/>
                    <FieldInfo FieldName="Zip" Label="Zip Code"/>
                    <FieldInfo FieldName="Phone" Label="Phone"/>
                    <FieldInfo FieldName="URL" Label="Website"/>
                </FieldsPopupContent>
            </PopupTemplate>
            <SimpleRenderer>
                <PictureMarkerSymbol Url="/images/soup.png" Height="18" Width="12" />
            </SimpleRenderer>
        </FeatureLayer>
    </WebMap>
    <ExpandWidget Position="OverlayPosition.TopRight" ExpandIcon="browser-map">
        <LayerListWidget />
    </ExpandWidget>
    <ExpandWidget Position="OverlayPosition.BottomLeft">
        <LegendWidget />
    </ExpandWidget>
</MapView>

@code
{    
    [Inject] 
    public required IMemoryCache MemoryCache { get; set; }

    [Inject]
    public required NavigationManager NavigationManager { get; set; }
        
    [Inject]
    public required IJSRuntime JSRuntime { get; set; }

    private async Task OnLayerViewCreate(LayerViewCreateEvent createEvent)
    {
        if (_featureLayer == createEvent.Layer)
        {
            await JSRuntime.InvokeVoidAsync("setLayerOnTop", _featureLayer.Id, _mapView!.Id, _mapView.CoreJsModule);
            if (!_dataLoaded)
            {
                _dataLoaded = true;
                await LoadFoodPantriesAsync();
            }
        }
    }

    private async Task LoadFoodPantriesAsync()
    {
        const string cacheKey = "foodPantries";
        if (!MemoryCache.TryGetValue(cacheKey, out List<FoodPantry>? foodPantries))
        {
            HttpClient httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(NavigationManager.BaseUri);
            string pantriesUrl = "/files/food_pantries.json";

            HttpResponseMessage response = await httpClient.GetAsync(pantriesUrl);
            response.EnsureSuccessStatusCode();
            string jsonResponse = await response.Content.ReadAsStringAsync();
            foodPantries = JsonSerializer.Deserialize<FoodBankData>(jsonResponse, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!
                .Organization;

            MemoryCache.Set(cacheKey, foodPantries, TimeSpan.FromHours(24));
        }

        if (foodPantries is not null)
        {
            List<Graphic> graphics = [];
            foreach (var pantry in foodPantries)
            {
                if (pantry.MailAddress.Latitude != 0 && pantry.MailAddress.Longitude != 0)
                {
                    Graphic graphic = new Graphic(
                        new Point(pantry.MailAddress.Longitude, pantry.MailAddress.Latitude), 
                        attributes: new AttributesDictionary(new Dictionary<string, object?>
                        {
                            { "OrganizationID", pantry.OrganizationID },
                            { "FullName", pantry.FullName },
                            { "Address1", pantry.MailAddress.Address1 },
                            { "Address2", pantry.MailAddress.Address2 },
                            { "City", pantry.MailAddress.City },
                            { "State", pantry.MailAddress.State },
                            { "Zip", pantry.MailAddress.Zip },
                            { "Phone", pantry.Phone },
                            { "URL", pantry.URL },
                            { "LogoUrl", pantry.LogoUrls.FoodBankLocator }
                        }));
                    graphics.Add(graphic);
                }
            }
            
            await _featureLayer.Add(graphics);
        }
    }

    private Task<string> GenerateLogo(PopupTemplateCreatorEvent creatorEvent)
    {
        string? logoUrl = creatorEvent.Graphic?.Attributes["LogoUrl"] as string;
        Console.WriteLine(logoUrl);
        if (logoUrl is null)
        {
            return Task.FromResult(string.Empty);
        }
                
        string pantryName = creatorEvent.Graphic?.Attributes["FullName"] as string 
            ?? "Food Pantry";
        string url = creatorEvent.Graphic?.Attributes["URL"] as string ?? "#";
        
        return Task.FromResult(
            $"<a target='_blank' href='https://{url}' style='width:100%;'>" +
            $"<img src='{logoUrl}' alt='{pantryName} Logo' width='150' style='padding: 0.5rem; margin: auto;' /></a>");
    }

    private MapView? _mapView;
    private FeatureLayer _featureLayer = new();
    private bool _dataLoaded;
    
    public record FoodBankData(List<FoodPantry> Organization);

    public record FoodPantry(int OrganizationID, string FullName, MailAddress MailAddress, 
        string URL, string Phone, LogoUrls LogoUrls);

    public record MailAddress(string Address1, string Address2, 
        string City, string State, string Zip, 
        double Latitude, double Longitude);

    public record LogoUrls(string FoodBankLocator);
}

```

## Source Code

```razor
<MapView @ref="_mapView" 
         Class="map-view" 
         OnLayerViewCreate="OnLayerViewCreate">
    <WebMap>
        <PortalItem PortalItemId="eb09c0c1a9eb4ad8afe0e0773d1c36a8" />
        <FeatureLayer Source="@([])"
                      Title="Food Pantries"
                      OutFields="@(["*"])"
                      GeometryType="FeatureGeometryType.Point"
                      ObjectIdField="OrganizationID"
                      @ref="_featureLayer">
            <Field Name="OrganizationID" Alias="Organization ID" Type="FieldType.Integer" />
            <Field Name="FullName" Alias="Full Name" Type="FieldType.String" />
            <Field Name="Address1" Alias="Address 1" Type="FieldType.String" />
            <Field Name="Address2" Alias="Address 2" Type="FieldType.String" />
            <Field Name="City" Alias="City" Type="FieldType.String" />
            <Field Name="State" Alias="State" Type="FieldType.String" />
            <Field Name="Zip" Alias="Zip Code" Type="FieldType.String" />
            <Field Name="Phone" Alias="Phone" Type="FieldType.String" />
            <Field Name="URL" Alias="Website" Type="FieldType.String" />
            <Field Name="LogoUrl" Alias="Logo URL" Type="FieldType.String" />
            <PopupTemplate Title="<a target='_blank' href='{URL}'>{FullName}</a>"
                           OutFields="@(["*"])">
                <CustomPopupContent CreatorFunction="GenerateLogo"
                                    OutFields="@(["*"])"/>
                <FieldsPopupContent>
                    <FieldInfo FieldName="Address1" Label="Address 1"/>
                    <FieldInfo FieldName="Address2" Label="Address 2"/>
                    <FieldInfo FieldName="City" Label="City"/>
                    <FieldInfo FieldName="State" Label="State"/>
                    <FieldInfo FieldName="Zip" Label="Zip Code"/>
                    <FieldInfo FieldName="Phone" Label="Phone"/>
                    <FieldInfo FieldName="URL" Label="Website"/>
                </FieldsPopupContent>
            </PopupTemplate>
            <SimpleRenderer>
                <PictureMarkerSymbol Url="/images/soup.png" Height="18" Width="12" />
            </SimpleRenderer>
        </FeatureLayer>
    </WebMap>
    <ExpandWidget Position="OverlayPosition.TopRight" ExpandIcon="browser-map">
        <LayerListWidget />
    </ExpandWidget>
    <ExpandWidget Position="OverlayPosition.BottomLeft">
        <LegendWidget />
    </ExpandWidget>
</MapView>

@code
{    
    [Inject] 
    public required IMemoryCache MemoryCache { get; set; }

    [Inject]
    public required NavigationManager NavigationManager { get; set; }
        
    [Inject]
    public required IJSRuntime JSRuntime { get; set; }

    private async Task OnLayerViewCreate(LayerViewCreateEvent createEvent)
    {
        if (_featureLayer == createEvent.Layer)
        {
            await JSRuntime.InvokeVoidAsync("setLayerOnTop", _featureLayer.Id, _mapView!.Id, _mapView.CoreJsModule);
            if (!_dataLoaded)
            {
                _dataLoaded = true;
                await LoadFoodPantriesAsync();
            }
        }
    }

    private async Task LoadFoodPantriesAsync()
    {
        const string cacheKey = "foodPantries";
        if (!MemoryCache.TryGetValue(cacheKey, out List<FoodPantry>? foodPantries))
        {
            HttpClient httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(NavigationManager.BaseUri);
            string pantriesUrl = "/files/food_pantries.json";

            HttpResponseMessage response = await httpClient.GetAsync(pantriesUrl);
            response.EnsureSuccessStatusCode();
            string jsonResponse = await response.Content.ReadAsStringAsync();
            foodPantries = JsonSerializer.Deserialize<FoodBankData>(jsonResponse, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!
                .Organization;

            MemoryCache.Set(cacheKey, foodPantries, TimeSpan.FromHours(24));
        }

        if (foodPantries is not null)
        {
            List<Graphic> graphics = [];
            foreach (var pantry in foodPantries)
            {
                if (pantry.MailAddress.Latitude != 0 && pantry.MailAddress.Longitude != 0)
                {
                    Graphic graphic = new Graphic(
                        new Point(pantry.MailAddress.Longitude, pantry.MailAddress.Latitude), 
                        attributes: new AttributesDictionary(new Dictionary<string, object?>
                        {
                            { "OrganizationID", pantry.OrganizationID },
                            { "FullName", pantry.FullName },
                            { "Address1", pantry.MailAddress.Address1 },
                            { "Address2", pantry.MailAddress.Address2 },
                            { "City", pantry.MailAddress.City },
                            { "State", pantry.MailAddress.State },
                            { "Zip", pantry.MailAddress.Zip },
                            { "Phone", pantry.Phone },
                            { "URL", pantry.URL },
                            { "LogoUrl", pantry.LogoUrls.FoodBankLocator }
                        }));
                    graphics.Add(graphic);
                }
            }
            
            await _featureLayer.Add(graphics);
        }
    }

    private Task<string> GenerateLogo(PopupTemplateCreatorEvent creatorEvent)
    {
        string? logoUrl = creatorEvent.Graphic?.Attributes["LogoUrl"] as string;
        Console.WriteLine(logoUrl);
        if (logoUrl is null)
        {
            return Task.FromResult(string.Empty);
        }
                
        string pantryName = creatorEvent.Graphic?.Attributes["FullName"] as string 
            ?? "Food Pantry";
        string url = creatorEvent.Graphic?.Attributes["URL"] as string ?? "#";
        
        return Task.FromResult(
            $"<a target='_blank' href='https://{url}' style='width:100%;'>" +
            $"<img src='{logoUrl}' alt='{pantryName} Logo' width='150' style='padding: 0.5rem; margin: auto;' /></a>");
    }

    private MapView? _mapView;
    private FeatureLayer _featureLayer = new();
    private bool _dataLoaded;
    
    public record FoodBankData(List<FoodPantry> Organization);

    public record FoodPantry(int OrganizationID, string FullName, MailAddress MailAddress, 
        string URL, string Phone, LogoUrls LogoUrls);

    public record MailAddress(string Address1, string Address2, 
        string City, string State, string Zip, 
        double Latitude, double Longitude);

    public record LogoUrls(string FoodBankLocator);
}

```