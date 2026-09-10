import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";

const libraries = ["places"];

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 12.2253,
  lng: 79.0747,
};

export default function RideLocationPicker({
  fromLocation,
  destinationLocation,
  onFromChange,
  onDestinationChange,
  onRouteCalculated,
}) {
  const [map, setMap] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const fromRef = useRef(null);
  const destinationRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const hasFrom =
    fromLocation?.latitude != null &&
    fromLocation?.longitude != null;

  const hasDestination =
    destinationLocation?.latitude != null &&
    destinationLocation?.longitude != null;

  /*
   * Create NEW Google autocomplete elements
   */
  useEffect(() => {
    if (!isLoaded) return;

    let fromAutocomplete;
    let destinationAutocomplete;

    const setupAutocomplete = async () => {
      try {
        const { PlaceAutocompleteElement } =
          await window.google.maps.importLibrary(
            "places"
          );

        // -----------------------------
        // FROM
        // -----------------------------

        fromAutocomplete =
          new PlaceAutocompleteElement();

        fromAutocomplete.placeholder =
          "Search pickup location";

        fromAutocomplete.includedRegionCodes = [
          "us",
          "in",
        ];

        fromAutocomplete.style.width = "100%";

        if (fromRef.current) {
          fromRef.current.innerHTML = "";

          fromRef.current.appendChild(
            fromAutocomplete
          );
        }

        fromAutocomplete.addEventListener(
          "gmp-select",
          async (event) => {
            try {
              const place =
                event.placePrediction.toPlace();

              await place.fetchFields({
                fields: [
                  "displayName",
                  "formattedAddress",
                  "location",
                ],
              });

              if (!place.location) return;

              const location = {
                address:
                  place.formattedAddress ||
                  place.displayName ||
                  "",

                latitude:
                  place.location.lat(),

                longitude:
                  place.location.lng(),
              };

              console.log(
                "From selected:",
                location
              );

              onFromChange(location);

              if (map) {
                map.panTo({
                  lat: location.latitude,
                  lng: location.longitude,
                });

                map.setZoom(12);
              }
            } catch (error) {
              console.error(
                "From location error:",
                error
              );
            }
          }
        );

        // -----------------------------
        // DESTINATION
        // -----------------------------

        destinationAutocomplete =
          new PlaceAutocompleteElement();

        destinationAutocomplete.placeholder =
          "Search destination";

        destinationAutocomplete.includedRegionCodes = [
          "us",
          "in",
        ];

        destinationAutocomplete.style.width =
          "100%";

        if (destinationRef.current) {
          destinationRef.current.innerHTML = "";

          destinationRef.current.appendChild(
            destinationAutocomplete
          );
        }

        destinationAutocomplete.addEventListener(
          "gmp-select",
          async (event) => {
            try {
              const place =
                event.placePrediction.toPlace();

              await place.fetchFields({
                fields: [
                  "displayName",
                  "formattedAddress",
                  "location",
                ],
              });

              if (!place.location) return;

              const location = {
                address:
                  place.formattedAddress ||
                  place.displayName ||
                  "",

                latitude:
                  place.location.lat(),

                longitude:
                  place.location.lng(),
              };

              console.log(
                "Destination selected:",
                location
              );

              onDestinationChange(location);

              if (map) {
                map.panTo({
                  lat: location.latitude,
                  lng: location.longitude,
                });

                map.setZoom(7);
              }
            } catch (error) {
              console.error(
                "Destination location error:",
                error
              );
            }
          }
        );
      } catch (error) {
        console.error(
          "Autocomplete setup error:",
          error
        );
      }
    };

    setupAutocomplete();

    return () => {
      if (fromRef.current) {
        fromRef.current.innerHTML = "";
      }

      if (destinationRef.current) {
        destinationRef.current.innerHTML = "";
      }
    };
  }, [isLoaded]);

  /*
   * Calculate road route
   */
  useEffect(() => {
    if (!isLoaded) return;

    if (!hasFrom || !hasDestination) {
      setRoutePath([]);
      setRouteInfo(null);

      onRouteCalculated?.(null);

      return;
    }

    let cancelled = false;

    const calculateRoute = async () => {
      try {
        console.log(
          "Calculating road route..."
        );

        const { Route } =
          await window.google.maps.importLibrary(
            "routes"
          );

        const result =
          await Route.computeRoutes({
            origin: {
              lat: fromLocation.latitude,
              lng: fromLocation.longitude,
            },

            destination: {
              lat: destinationLocation.latitude,
              lng: destinationLocation.longitude,
            },

            travelMode: "DRIVING",

            fields: [
              "distanceMeters",
              "durationMillis",
              "path",
              "viewport",
            ],

            units:
              window.google.maps.UnitSystem.METRIC,
          });

        if (cancelled) return;

        if (
          !result.routes ||
          result.routes.length === 0
        ) {
          console.log("No route found");
          return;
        }

        const route = result.routes[0];

        const distanceKm =
          route.distanceMeters / 1000;

        const durationMinutes =
          route.durationMillis / 60000;

        const hours =
          Math.floor(durationMinutes / 60);

        const minutes =
          Math.round(durationMinutes % 60);

        const formattedDuration =
          hours > 0
            ? `${hours} hr ${minutes} min`
            : `${minutes} min`;

        const info = {
          distanceKm: Number(
            distanceKm.toFixed(1)
          ),

          durationMinutes: Math.round(
            durationMinutes
          ),

          formattedDuration,
        };

        console.log(
          "Route calculated:",
          info
        );

        setRouteInfo(info);

        onRouteCalculated?.(info);

        if (route.path) {
          setRoutePath(route.path);
        }

        if (map && route.viewport) {
          map.fitBounds(
            route.viewport,
            50
          );
        }
      } catch (error) {
        console.error(
          "Route calculation failed:",
          error
        );

        setRouteInfo(null);
        setRoutePath([]);

        onRouteCalculated?.(null);
      }
    };

    calculateRoute();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    fromLocation?.latitude,
    fromLocation?.longitude,
    destinationLocation?.latitude,
    destinationLocation?.longitude,
  ]);

  /*
   * Initial map center
   */
  const center = hasFrom
    ? {
        lat: fromLocation.latitude,
        lng: fromLocation.longitude,
      }
    : defaultCenter;

  if (loadError) {
    return (
      <div style={{ color: "red" }}>
        Google Maps failed to load.
      </div>
    );
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <div>
      {/* ========================= */}
      {/* LOCATION SEARCH FIELDS */}
      {/* ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            From
          </label>

          <div ref={fromRef} />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Destination
          </label>

          <div ref={destinationRef} />
        </div>
      </div>

      {/* ========================= */}
      {/* MAP */}
      {/* ========================= */}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={hasFrom ? 10 : 6}
        onLoad={(mapInstance) => {
          console.log("Map loaded");
          setMap(mapInstance);
        }}
        onUnmount={() => {
          setMap(null);
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* FROM MARKER */}

        {hasFrom && (
          <Marker
            position={{
              lat: fromLocation.latitude,
              lng: fromLocation.longitude,
            }}
          />
        )}

        {/* DESTINATION MARKER */}

        {hasDestination && (
          <Marker
            position={{
              lat: destinationLocation.latitude,
              lng: destinationLocation.longitude,
            }}
          />
        )}

        {/* ROAD ROUTE */}

        {routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>

      {/* ========================= */}
      {/* DISTANCE + ETA */}
      {/* ========================= */}

      {routeInfo && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            marginTop: "14px",
            padding: "14px",
            borderRadius: "10px",
            background: "#f5f5f5",
          }}
        >
          <div>
            <strong>Distance</strong>
            <br />
            {routeInfo.distanceKm} km
          </div>

          <div>
            <strong>Estimated time</strong>
            <br />
            {routeInfo.formattedDuration}
          </div>
        </div>
      )}
    </div>
  );
}