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
  height: "350px",
};

const defaultCenter = {
  lat: 12.2253,
  lng: 79.0747,
};

export default function LocationPicker({
  label,
  value,
  onChange,

  // NEW
  otherLocation = null,
  isFrom = false,
  onRouteCalculated,
}) {
  const [map, setMap] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const autocompleteContainerRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const hasLocation =
    value?.latitude != null &&
    value?.longitude != null;

  const hasOtherLocation =
    otherLocation?.latitude != null &&
    otherLocation?.longitude != null;

  const center = hasLocation
    ? {
        lat: value.latitude,
        lng: value.longitude,
      }
    : defaultCenter;

  /*
   * Google NEW Place Autocomplete
   */
  useEffect(() => {
    if (!isLoaded) return;
    if (!autocompleteContainerRef.current) return;

    let autocomplete;

    const createAutocomplete = async () => {
      try {
        const { PlaceAutocompleteElement } =
          await window.google.maps.importLibrary("places");

        autocomplete = new PlaceAutocompleteElement();

        autocomplete.placeholder = `Search ${label}`;

        autocomplete.includedRegionCodes = ["us", "in"];

        autocomplete.style.width = "100%";

        autocompleteContainerRef.current.innerHTML = "";

        autocompleteContainerRef.current.appendChild(
          autocomplete
        );

        autocomplete.addEventListener(
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

              if (!place.location) {
                console.log(
                  "Selected place has no location"
                );
                return;
              }

              const latitude =
                place.location.lat();

              const longitude =
                place.location.lng();

              const address =
                place.formattedAddress ||
                place.displayName ||
                "";

              const location = {
                address,
                latitude,
                longitude,
              };

              console.log(
                `${label} selected:`,
                location
              );

              onChange(location);

              if (map) {
                map.panTo({
                  lat: latitude,
                  lng: longitude,
                });

                map.setZoom(14);
              }
            } catch (error) {
              console.error(
                "Place selection error:",
                error
              );
            }
          }
        );
      } catch (error) {
        console.error(
          "Failed to create autocomplete:",
          error
        );
      }
    };

    createAutocomplete();

    return () => {
      if (autocompleteContainerRef.current) {
        autocompleteContainerRef.current.innerHTML =
          "";
      }
    };
  }, [isLoaded, label]);

  /*
   * Calculate road route
   *
   * Only calculate from the FROM picker.
   * This prevents both LocationPicker instances
   * from making the same API request.
   */
  useEffect(() => {
    if (!isLoaded) return;

    if (!isFrom) return;

    if (!hasLocation || !hasOtherLocation) {
      setRouteInfo(null);
      setRoutePolyline([]);

      if (onRouteCalculated) {
        onRouteCalculated(null);
      }

      return;
    }

    let cancelled = false;

    const calculateRoute = async () => {
      try {
        console.log("Calculating road route...");

        const { Route } =
          await window.google.maps.importLibrary(
            "routes"
          );

        const request = {
          origin: {
            lat: value.latitude,
            lng: value.longitude,
          },

          destination: {
            lat: otherLocation.latitude,
            lng: otherLocation.longitude,
          },

          travelMode: "DRIVING",

          /*
           * Ask Google for actual road path,
           * distance and duration.
           */
          fields: [
            "distanceMeters",
            "durationMillis",
            "path",
          ],

          units:
            window.google.maps.UnitSystem.METRIC,
        };

        const result =
          await Route.computeRoutes(request);

        if (
          cancelled ||
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
          "Road route:",
          info
        );

        setRouteInfo(info);

        /*
         * Send the calculated information
         * back to OfferRide.
         */
        if (onRouteCalculated) {
          onRouteCalculated(info);
        }

        /*
         * Draw route on map.
         */
        if (map && route.path) {
          setRoutePolyline(route.path);

          if (route.viewport) {
            map.fitBounds(
              route.viewport,
              50
            );
          }
        }
      } catch (error) {
        console.error(
          "Route calculation failed:",
          error
        );

        setRouteInfo(null);

        if (onRouteCalculated) {
          onRouteCalculated(null);
        }
      }
    };

    calculateRoute();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    isFrom,
    value?.latitude,
    value?.longitude,
    otherLocation?.latitude,
    otherLocation?.longitude,
  ]);

  /*
   * Map click
   */
  const handleMapClick = (event) => {
    if (!event.latLng) return;

    const latitude = event.latLng.lat();
    const longitude = event.latLng.lng();

    const location = {
      address: value?.address || "",
      latitude,
      longitude,
    };

    console.log("Map clicked:", location);

    onChange(location);
  };

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
    <div style={{ width: "100%" }}>
      {/* Search */}
      <div
        ref={autocompleteContainerRef}
        style={{
          width: "100%",
          marginBottom: "10px",
        }}
      />

      {/* Route information */}
      {isFrom && routeInfo && (
        <div
          style={{
            padding: "10px 12px",
            marginBottom: "10px",
            borderRadius: "8px",
            background: "#f5f5f5",
            fontSize: "14px",
          }}
        >
          <strong>
            🚗 Estimated trip
          </strong>

          <div>
            Distance:{" "}
            {routeInfo.distanceKm} km
          </div>

          <div>
            Travel time:{" "}
            {routeInfo.formattedDuration}
          </div>
        </div>
      )}

      {/* Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={hasLocation ? 14 : 6}
        onLoad={(mapInstance) => {
          console.log("Map loaded");
          setMap(mapInstance);
        }}
        onUnmount={() => {
          setMap(null);
        }}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {hasLocation && (
          <Marker
            position={{
              lat: value.latitude,
              lng: value.longitude,
            }}
          />
        )}

        {hasOtherLocation && (
          <Marker
            position={{
              lat: otherLocation.latitude,
              lng: otherLocation.longitude,
            }}
          />
        )}

        {routePolyline.length > 0 && (
          <Polyline
            path={routePolyline}
            options={{
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}