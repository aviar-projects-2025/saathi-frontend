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

  const [fromCountryCode, setFromCountryCode] = useState(null);

  const [mapSelectionMode, setMapSelectionMode] =
    useState("from");

  // ---------------------------------------------
  // DOM refs
  // ---------------------------------------------

  const fromContainerRef = useRef(null);
  const destinationContainerRef = useRef(null);

  const fromAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  const mapRef = useRef(null);
  const geocoderRef = useRef(null);

  // ---------------------------------------------
  // Callback refs
  // ---------------------------------------------

  const onFromChangeRef = useRef(onFromChange);
  const onDestinationChangeRef =
    useRef(onDestinationChange);
  const onRouteCalculatedRef =
    useRef(onRouteCalculated);

  const fromCountryCodeRef = useRef(null);

  // ---------------------------------------------
  // Keep callbacks updated
  // ---------------------------------------------

  useEffect(() => {
    onFromChangeRef.current = onFromChange;
  }, [onFromChange]);

  useEffect(() => {
    onDestinationChangeRef.current =
      onDestinationChange;
  }, [onDestinationChange]);

  useEffect(() => {
    onRouteCalculatedRef.current =
      onRouteCalculated;
  }, [onRouteCalculated]);

  // ---------------------------------------------
  // Google Maps loader
  // ---------------------------------------------

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // ---------------------------------------------
  // Check locations
  // ---------------------------------------------

  const hasFrom =
    fromLocation?.latitude != null &&
    fromLocation?.longitude != null;

  const hasDestination =
    destinationLocation?.latitude != null &&
    destinationLocation?.longitude != null;

  // ---------------------------------------------
  // Set autocomplete input value
  // ---------------------------------------------

  const setAutocompleteValue = (
    autocompleteRef,
    value
  ) => {
    if (!autocompleteRef.current) return;

    autocompleteRef.current.value =
      value || "";
  };

  // ---------------------------------------------
  // Get country from new Places API Place
  // ---------------------------------------------

  const getCountryFromPlace = (place) => {
    const country =
      place?.addressComponents?.find(
        (component) =>
          component.types?.includes("country")
      );

    return (
      country?.shortText?.toLowerCase() ||
      null
    );
  };

  // ---------------------------------------------
  // Get country from Geocoder
  // ---------------------------------------------

  const getCountryFromGeocoder = (result) => {
    const country =
      result?.address_components?.find(
        (component) =>
          component.types?.includes("country")
      );

    return (
      country?.short_name?.toLowerCase() ||
      null
    );
  };

  // ---------------------------------------------
  // Reverse geocode
  // ---------------------------------------------

  const reverseGeocode = (
    latitude,
    longitude
  ) => {
    return new Promise((resolve) => {
      if (!geocoderRef.current) {
        geocoderRef.current =
          new window.google.maps.Geocoder();
      }

      geocoderRef.current.geocode(
        {
          location: {
            lat: latitude,
            lng: longitude,
          },
        },
        (results, status) => {
          if (
            status !== "OK" ||
            !results ||
            results.length === 0
          ) {
            console.error(
              "Reverse geocode failed:",
              status
            );

            resolve(null);
            return;
          }

          const result = results[0];

          resolve({
            address:
              result.formatted_address || "",
            countryCode:
              getCountryFromGeocoder(result),
          });
        }
      );
    });
  };

  // ---------------------------------------------
  // UPDATE FROM LOCATION
  // ---------------------------------------------

  const updateFromLocation = async (
    latitude,
    longitude
  ) => {
    try {
      const result = await reverseGeocode(
        latitude,
        longitude
      );

      if (!result) return;

      const newCountryCode =
        result.countryCode;

      const oldCountryCode =
        fromCountryCodeRef.current;

      console.log(
        "FROM moved:",
        result.address,
        latitude,
        longitude
      );

      console.log(
        "Country:",
        oldCountryCode,
        "→",
        newCountryCode
      );

      // -----------------------------------------
      // If From country changed,
      // clear destination
      // -----------------------------------------

      if (
        oldCountryCode &&
        newCountryCode &&
        oldCountryCode !== newCountryCode
      ) {
        console.log(
          "From country changed. Clearing destination."
        );

        const emptyDestination = {
          address: "",
          latitude: null,
          longitude: null,
        };

        onDestinationChangeRef.current?.(
          emptyDestination
        );

        setAutocompleteValue(
          destinationAutocompleteRef,
          ""
        );

        setRoutePath([]);
        setRouteInfo(null);

        onRouteCalculatedRef.current?.(
          null
        );
      }

      // -----------------------------------------
      // Save country
      // -----------------------------------------

      fromCountryCodeRef.current =
        newCountryCode;

      setFromCountryCode(
        newCountryCode
      );

      // -----------------------------------------
      // Create location
      // -----------------------------------------

      const location = {
        address: result.address,
        latitude,
        longitude,
      };

      // -----------------------------------------
      // IMPORTANT:
      // Update Google From field
      // -----------------------------------------

      setAutocompleteValue(
        fromAutocompleteRef,
        result.address
      );

      // -----------------------------------------
      // Update parent React state
      // -----------------------------------------

      onFromChangeRef.current?.(
        location
      );

      // -----------------------------------------
      // Automatically switch to destination
      // -----------------------------------------

      setMapSelectionMode(
        "destination"
      );
    } catch (error) {
      console.error(
        "Failed to update From location:",
        error
      );
    }
  };

  // ---------------------------------------------
  // UPDATE DESTINATION LOCATION
  // ---------------------------------------------

  const updateDestinationLocation = async (
    latitude,
    longitude
  ) => {
    try {
      const result = await reverseGeocode(
        latitude,
        longitude
      );

      if (!result) return;

      const selectedCountry =
        result.countryCode;

      const currentFromCountry =
        fromCountryCodeRef.current;

      // -----------------------------------------
      // Country validation
      // -----------------------------------------

      if (
        currentFromCountry &&
        selectedCountry &&
        currentFromCountry !== selectedCountry
      ) {
        alert(
          "Destination must be in the same country as the From location."
        );

        return;
      }

      const location = {
        address: result.address,
        latitude,
        longitude,
      };

      console.log(
        "DESTINATION moved:",
        location
      );

      // -----------------------------------------
      // IMPORTANT:
      // Update Google Destination field
      // -----------------------------------------

      setAutocompleteValue(
        destinationAutocompleteRef,
        result.address
      );

      // -----------------------------------------
      // Update React parent state
      // -----------------------------------------

      onDestinationChangeRef.current?.(
        location
      );

      setMapSelectionMode(
        "destination"
      );
    } catch (error) {
      console.error(
        "Failed to update Destination location:",
        error
      );
    }
  };

  // ---------------------------------------------
  // CREATE GOOGLE AUTOCOMPLETE
  // ---------------------------------------------

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    const setupAutocomplete = async () => {
      try {
        const {
          PlaceAutocompleteElement,
        } =
          await window.google.maps.importLibrary(
            "places"
          );

        if (cancelled) return;

        // =========================================
        // FROM
        // =========================================

        const fromAutocomplete =
          new PlaceAutocompleteElement();

        fromAutocomplete.placeholder =
          "Search pickup location";

        fromAutocomplete.includedRegionCodes = [
          "us",
          "in",
        ];

        fromAutocomplete.style.width =
          "100%";

        fromAutocompleteRef.current =
          fromAutocomplete;

        if (fromContainerRef.current) {
          fromContainerRef.current.innerHTML =
            "";

          fromContainerRef.current.appendChild(
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
                  "addressComponents",
                ],
              });

              if (!place.location) {
                return;
              }

              const address =
                place.formattedAddress ||
                place.displayName ||
                "";

              const latitude =
                place.location.lat();

              const longitude =
                place.location.lng();

              const countryCode =
                getCountryFromPlace(place);

              console.log(
                "FROM selected:",
                address,
                latitude,
                longitude,
                countryCode
              );

              // -----------------------------------
              // Check country change
              // -----------------------------------

              const oldCountry =
                fromCountryCodeRef.current;

              if (
                oldCountry &&
                countryCode &&
                oldCountry !== countryCode
              ) {
                console.log(
                  "From country changed. Clearing destination."
                );

                onDestinationChangeRef.current?.(
                  {
                    address: "",
                    latitude: null,
                    longitude: null,
                  }
                );

                setAutocompleteValue(
                  destinationAutocompleteRef,
                  ""
                );

                setRoutePath([]);
                setRouteInfo(null);

                onRouteCalculatedRef.current?.(
                  null
                );
              }

              // -----------------------------------
              // Save country
              // -----------------------------------

              fromCountryCodeRef.current =
                countryCode;

              setFromCountryCode(
                countryCode
              );

              // -----------------------------------
              // Parent state
              // -----------------------------------

              onFromChangeRef.current?.({
                address,
                latitude,
                longitude,
              });

              // -----------------------------------
              // Move map
              // -----------------------------------

              if (mapRef.current) {
                mapRef.current.panTo({
                  lat: latitude,
                  lng: longitude,
                });

                mapRef.current.setZoom(10);
              }

              // -----------------------------------
              // Next map mode = destination
              // -----------------------------------

              setMapSelectionMode(
                "destination"
              );
            } catch (error) {
              console.error(
                "From selection error:",
                error
              );
            }
          }
        );

        // =========================================
        // DESTINATION
        // =========================================

        const destinationAutocomplete =
          new PlaceAutocompleteElement();

        destinationAutocomplete.placeholder =
          "Search destination";

        destinationAutocomplete.includedRegionCodes =
          ["us", "in"];

        destinationAutocomplete.style.width =
          "100%";

        destinationAutocompleteRef.current =
          destinationAutocomplete;

        if (
          destinationContainerRef.current
        ) {
          destinationContainerRef.current.innerHTML =
            "";

          destinationContainerRef.current.appendChild(
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
                  "addressComponents",
                ],
              });

              if (!place.location) {
                return;
              }

              const address =
                place.formattedAddress ||
                place.displayName ||
                "";

              const latitude =
                place.location.lat();

              const longitude =
                place.location.lng();

              const countryCode =
                getCountryFromPlace(place);

              // -----------------------------------
              // Read latest country from REF
              // -----------------------------------

              const currentFromCountry =
                fromCountryCodeRef.current;

              console.log(
                "DESTINATION selected:",
                address,
                latitude,
                longitude,
                countryCode
              );

              console.log(
                "From country:",
                currentFromCountry
              );

              // -----------------------------------
              // Country validation
              // -----------------------------------

              if (
                currentFromCountry &&
                countryCode &&
                currentFromCountry !==
                countryCode
              ) {
                alert(
                  "Destination must be in the same country as the From location."
                );

                destinationAutocomplete.value =
                  "";

                return;
              }

              // -----------------------------------
              // Update parent
              // -----------------------------------

              onDestinationChangeRef.current?.({
                address,
                latitude,
                longitude,
              });

              // -----------------------------------
              // Map
              // -----------------------------------

              if (mapRef.current) {
                mapRef.current.panTo({
                  lat: latitude,
                  lng: longitude,
                });

                mapRef.current.setZoom(7);
              }

              setMapSelectionMode(
                "destination"
              );
            } catch (error) {
              console.error(
                "Destination selection error:",
                error
              );
            }
          }
        );
      } catch (error) {
        console.error(
          "Autocomplete setup failed:",
          error
        );
      }
    };

    setupAutocomplete();

    return () => {
      cancelled = true;

      if (fromContainerRef.current) {
        fromContainerRef.current.innerHTML =
          "";
      }

      if (
        destinationContainerRef.current
      ) {
        destinationContainerRef.current.innerHTML =
          "";
      }

      fromAutocompleteRef.current = null;
      destinationAutocompleteRef.current =
        null;
    };
  }, [isLoaded]);

  // ---------------------------------------------
  // RESTRICT DESTINATION COUNTRY
  // ---------------------------------------------

  useEffect(() => {
    const autocomplete =
      destinationAutocompleteRef.current;

    if (!autocomplete) return;

    if (fromCountryCode) {
      autocomplete.includedRegionCodes = [
        fromCountryCode,
      ];

      autocomplete.placeholder =
        `Search destination`;
    } else {
      autocomplete.includedRegionCodes = [
        "us",
        "in",
      ];

      autocomplete.placeholder =
        "Search destination";
    }
  }, [fromCountryCode]);

  // ---------------------------------------------
  // EXISTING RIDE / EDIT MODE
  // Detect From country
  // ---------------------------------------------

  useEffect(() => {
    if (
      !isLoaded ||
      !hasFrom ||
      fromCountryCodeRef.current
    ) {
      return;
    }

    let cancelled = false;

    const detectCountry = async () => {
      const result =
        await reverseGeocode(
          fromLocation.latitude,
          fromLocation.longitude
        );

      if (
        cancelled ||
        !result?.countryCode
      ) {
        return;
      }

      fromCountryCodeRef.current =
        result.countryCode;

      setFromCountryCode(
        result.countryCode
      );

      // Also synchronize the existing From
      // address into Google autocomplete.
      if (fromLocation.address) {
        setAutocompleteValue(
          fromAutocompleteRef,
          fromLocation.address
        );
      }

      if (destinationLocation?.address) {
        setAutocompleteValue(
          destinationAutocompleteRef,
          destinationLocation.address
        );
      }
    };

    detectCountry();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    hasFrom,
    fromLocation?.latitude,
    fromLocation?.longitude,
  ]);

  // ---------------------------------------------
  // Synchronize fields when parent form changes
  // ---------------------------------------------

  useEffect(() => {
    if (!isLoaded) return;

    if (fromLocation?.address) {
      setAutocompleteValue(
        fromAutocompleteRef,
        fromLocation.address
      );
    }
  }, [
    isLoaded,
    fromLocation?.address,
  ]);

  useEffect(() => {
    if (!isLoaded) return;

    if (destinationLocation?.address) {
      setAutocompleteValue(
        destinationAutocompleteRef,
        destinationLocation.address
      );
    }
  }, [
    isLoaded,
    destinationLocation?.address,
  ]);

  // ---------------------------------------------
  // CALCULATE ROUTE
  // ---------------------------------------------

  useEffect(() => {
    if (!isLoaded) return;

    if (!hasFrom || !hasDestination) {
      setRoutePath([]);
      setRouteInfo(null);

      onRouteCalculatedRef.current?.(
        null
      );

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
              lat:
                destinationLocation.latitude,
              lng:
                destinationLocation.longitude,
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
          setRoutePath([]);
          setRouteInfo(null);

          onRouteCalculatedRef.current?.(
            null
          );

          return;
        }

        const route = result.routes[0];

        const distanceKm =
          route.distanceMeters / 1000;

        const durationMinutes =
          route.durationMillis / 60000;

        const hours = Math.floor(
          durationMinutes / 60
        );

        const minutes = Math.round(
          durationMinutes % 60
        );

        const formattedDuration =
          hours > 0
            ? `${hours} hr ${minutes} min`
            : `${minutes} min`;

        const info = {
          distanceKm: Number(
            distanceKm.toFixed(1)
          ),

          // DATABASE VALUE
          durationMinutes:
            Math.round(durationMinutes),

          // DISPLAY VALUE
          formattedDuration,
        };

        console.log(
          "Route calculated:",
          info
        );

        setRouteInfo(info);

        onRouteCalculatedRef.current?.(
          info
        );

        if (route.path) {
          setRoutePath(route.path);
        }

        if (
          mapRef.current &&
          route.viewport
        ) {
          mapRef.current.fitBounds(
            route.viewport,
            50
          );
        }
      } catch (error) {
        console.error(
          "Route calculation failed:",
          error
        );

        setRoutePath([]);
        setRouteInfo(null);

        onRouteCalculatedRef.current?.(
          null
        );
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

  // ---------------------------------------------
  // MAP CLICK
  // ---------------------------------------------

  const handleMapClick = async (event) => {
    if (!event.latLng) return;

    const latitude =
      event.latLng.lat();

    const longitude =
      event.latLng.lng();

    console.log(
      "Map clicked:",
      latitude,
      longitude,
      "Mode:",
      mapSelectionMode
    );

    if (mapSelectionMode === "from") {
      await updateFromLocation(
        latitude,
        longitude
      );
    } else {
      await updateDestinationLocation(
        latitude,
        longitude
      );
    }
  };

  // ---------------------------------------------
  // FROM MARKER DRAG
  // ---------------------------------------------

  const handleFromMarkerDragEnd =
    async (event) => {
      if (!event.latLng) return;

      const latitude =
        event.latLng.lat();

      const longitude =
        event.latLng.lng();

      console.log(
        "From marker dragged:",
        latitude,
        longitude
      );

      await updateFromLocation(
        latitude,
        longitude
      );
    };

  // ---------------------------------------------
  // DESTINATION MARKER DRAG
  // ---------------------------------------------

  const handleDestinationMarkerDragEnd =
    async (event) => {
      if (!event.latLng) return;

      const latitude =
        event.latLng.lat();

      const longitude =
        event.latLng.lng();

      console.log(
        "Destination marker dragged:",
        latitude,
        longitude
      );

      await updateDestinationLocation(
        latitude,
        longitude
      );
    };

  // ---------------------------------------------
  // MAP LOAD
  // ---------------------------------------------

  const handleMapLoad = (mapInstance) => {
    console.log("Map loaded");

    setMap(mapInstance);
    mapRef.current = mapInstance;
  };

  const handleMapUnmount = () => {
    setMap(null);
    mapRef.current = null;
  };

  // ---------------------------------------------
  // CENTER
  // ---------------------------------------------

  const center = hasFrom
    ? {
      lat: fromLocation.latitude,
      lng: fromLocation.longitude,
    }
    : defaultCenter;

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------

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

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------

  return (
    <div>
      {/* =========================================
          SEARCH FIELDS
      ========================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {/* FROM */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px", // mb: 0.5
              fontSize: "0.82rem",
              color: "rgba(0, 0, 0, 0.5)", // text.secondary
              fontWeight: 400,
            }}
          >
            From
          </label>

          <div ref={fromContainerRef} />
        </div>

        {/* DESTINATION */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "0.82rem",
              color: "rgba(0, 0, 0, 0.5)",
              fontWeight: 400,
            }}
          >
            Destination
          </label>

          <div ref={destinationContainerRef} />
        </div>
      </div>

      {/* =========================================
          MAP SELECTION
      ========================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "6px",
        }}
      >
        <strong
          style={{
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Select on map:
        </strong>

        <button
          type="button"
          onClick={() => setMapSelectionMode("from")}
          style={{
            padding: "5px 9px",
            borderRadius: "6px",
            border:
              mapSelectionMode === "from"
                ? "1.5px solid #E8650A"
                : "1px solid #ccc",
            background:
              mapSelectionMode === "from"
                ? "#fff3eb"
                : "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            lineHeight: 1.2,
          }}
        >
          From
        </button>

        <button
          type="button"
          onClick={() => setMapSelectionMode("destination")}
          style={{
            padding: "5px 9px",
            borderRadius: "6px",
            border:
              mapSelectionMode === "destination"
                ? "1.5px solid #E8650A"
                : "1px solid #ccc",
            background:
              mapSelectionMode === "destination"
                ? "#fff3eb"
                : "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            lineHeight: 1.2,
          }}
        >
          Destination
        </button>
      </div>

      <div
        style={{
          marginBottom: "6px",
          fontSize: "13.5px",
          color: "#666",
          lineHeight: 1.4,
        }}
      >
        Click the map to select{" "}
        <strong>
          {mapSelectionMode === "from"
            ? "From"
            : "Destination"}
        </strong>
        . You can also drag either marker.
      </div>

      {/* =========================================
          MAP
      ========================================= */}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={hasFrom ? 10 : 6}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        onClick={handleMapClick}
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
            draggable={true}
            onDragEnd={
              handleFromMarkerDragEnd
            }
            onClick={() =>
              setMapSelectionMode(
                "from"
              )
            }
          />
        )}

        {/* DESTINATION MARKER */}

        {hasDestination && (
          <Marker
            position={{
              lat:
                destinationLocation.latitude,
              lng:
                destinationLocation.longitude,
            }}
            draggable={true}
            onDragEnd={
              handleDestinationMarkerDragEnd
            }
            onClick={() =>
              setMapSelectionMode(
                "destination"
              )
            }
          />
        )}

        {/* ROUTE */}

        {routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>

      {/* =========================================
          ROUTE INFORMATION
      ========================================= */}

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
            <strong>
              Distance
            </strong>

            <br />

            {routeInfo.distanceKm} km
          </div>

          <div>
            <strong>
              Estimated time
            </strong>

            <br />

            {routeInfo.formattedDuration}
          </div>
        </div>
      )}
    </div>
  );
}