/*mapboxgl.accessToken = mapToken;

if (listing && listing.geometry && listing.geometry.coordinates) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates,
    zoom: 9,
  });

  const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="map-click">
          <h4><b>${listing.title}</b></h4> 
          <p>Exact location will be provided after booking.</p>
        </div>`
      )
    )
    .addTo(map);

  map.addControl(new mapboxgl.ScaleControl());
  map.addControl(new mapboxgl.NavigationControl());
} else {
  console.error("No coordinates found for this listing.");
}


/*
    let mapToken = "<%= process.env.MAP_TOKEN %>";
    console.log(mapToken);
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: "map", // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: "mapbox://styles/mapbox/streets-v12", // style URL
        center: [77.209, 28.6139], // starting position [lng, lat]
        zoom: 9, // starting zoom
    });
*/
/*
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    center: [77.209, 28.6139], // starting position [lng, lat]
    zoom: 9, // starting zoom
});

// Optionally add a marker at listing location
if (listing && listing.geometry) {
    new mapboxgl.Marker()
        .setLngLat(listing.geometry.coordinates)
        .addTo(map);
}*/
/*
mapboxgl.accessToken = mapToken;

if (
  listing &&
  listing.geometry &&
  Array.isArray(listing.geometry.coordinates) &&
  listing.geometry.coordinates.length === 2
) {
  const coords = listing.geometry.coordinates;

  console.log("Final Coords for Mapbox:", coords);

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coords, // [lng, lat]
    zoom: 9,
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(coords)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="map-click">
          <h4><b>${listing.title}</b></h4> 
          <p>Exact location will be provided after booking.</p>
        </div>`
      )
    )
    .addTo(map);

  map.addControl(new mapboxgl.ScaleControl());
  map.addControl(new mapboxgl.NavigationControl());
} else {
  console.error("⚠️ No valid coordinates found for this listing:", listing?.geometry?.coordinates);
}
*/
mapboxgl.accessToken = mapToken;

if (
  listing &&
  listing.geometry &&
  Array.isArray(listing.geometry.coordinates) &&
  listing.geometry.coordinates.length === 2
) {
  const [lng, lat] = listing.geometry.coordinates;

  if (!isNaN(lng) && !isNaN(lat)) {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 9,
    });

    // ✅ Create popup (only opens when marker clicked)
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<div class="map-click">
        <h4><b>${listing.title}</b></h4> 
        <p>Exact location will be provided after booking.</p>
      </div>`
    );

    // ✅ Marker with popup
    new mapboxgl.Marker({ color: "red" })
      .setLngLat([lng, lat])
      .setPopup(popup) // opens only on click
      .addTo(map);

    map.addControl(new mapboxgl.ScaleControl());
    map.addControl(new mapboxgl.NavigationControl());
  } else {
    console.error("⚠️ Invalid coordinates:", listing.geometry.coordinates);
  }
} else {
  console.error("⚠️ No coordinates found for this listing.");
}
