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

const EMPTY_LOCATION = {
  address: "",
  latitude: null,
  longitude: null,
};

/*
 * Removes Google Plus Codes from the beginning
 *
 * Example:
 *
 * W4JP+C9Q, Thottapalayam, Vellore, Tamil Nadu 632004, India
 *
 * becomes:
 *
 * Thottapalayam, Vellore, Tamil Nadu 632004, India
 */
const cleanAddress = (address = "") => {
  return address
    .replace(
      /^[A-Z0-9]{2,8}\+[A-Z0-9]{2,8},?\s*/i,
      ""
    )
    .trim();
};

export default function RideLocationPicker({
  fromLocation,
  destinationLocation,
  onFromChange,
  onDestinationChange,
  onRouteCalculated,
}) {
  const [map, setMap] = useState(null);

  const mapRef = useRef(null);

  const [routePath, setRoutePath] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const [mapTarget, setMapTarget] = useState("from");

  const [fromCountryCode, setFromCountryCode] =
    useState(null);

  const fromCountryCodeRef = useRef(null);

  const [locationError, setLocationError] =
    useState("");

  /*
   * DOM containers for Google's custom autocomplete
   */
  const fromRef = useRef(null);
  const destinationRef = useRef(null);

  /*
   * Actual Google autocomplete elements
   */
  const fromAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  /*
   * Keep latest callbacks available inside
   * Google event listeners.
   */
  const onFromChangeRef = useRef(onFromChange);
  const onDestinationChangeRef =
    useRef(onDestinationChange);
  const onRouteCalculatedRef =
    useRef(onRouteCalculated);

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

  /*
   * Google Maps loader
   */
  const { isLoaded, loadError } =
    useJsApiLoader({
      googleMapsApiKey:
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries,
    });

  /*
   * Check whether coordinates exist
   */
  const hasFrom =
    fromLocation?.latitude != null &&
    fromLocation?.longitude != null;

  const hasDestination =
    destinationLocation?.latitude != null &&
    destinationLocation?.longitude != null;

  /*
   * Keep country ref synchronized
   */
  useEffect(() => {
    fromCountryCodeRef.current =
      fromCountryCode;
  }, [fromCountryCode]);

  /*
   * Update Google autocomplete field value
   *
   * PlaceAutocompleteElement is a custom HTML
   * element, so React cannot control it like a
   * normal <input>.
   */
  const setAutocompleteValue = (
    autocompleteRef,
    value
  ) => {
    if (autocompleteRef.current) {
      autocompleteRef.current.value =
        value || "";
    }
  };

  /*
   * Extract country code from new Places API
   */
  const getCountryCodeFromPlace = (place) => {
    const country =
      place?.addressComponents?.find(
        (component) =>
          component.types?.includes("country")
      );

    return (
      country?.shortText?.toLowerCase() ||
      country?.longText?.toLowerCase() ||
      null
    );
  };

  /*
   * Reverse geocode coordinates.
   *
   * Used when:
   * - marker is dragged
   * - map is clicked
   */
  const reverseGeocode = (
    latitude,
    longitude
  ) => {
    return new Promise(
      (resolve, reject) => {
        if (
          !window.google?.maps?.Geocoder
        ) {
          reject(
            new Error(
              "Google Geocoder is not available"
            )
          );
          return;
        }

        const geocoder =
          new window.google.maps.Geocoder();

        geocoder.geocode(
          {
            location: {
              lat: latitude,
              lng: longitude,
            },
          },
          (results, status) => {
            if (
              status !== "OK" ||
              !results?.length
            ) {
              reject(
                new Error(
                  `Reverse geocoding failed: ${status}`
                )
              );
              return;
            }

            const result = results[0];

            const country =
              result.address_components?.find(
                (component) =>
                  component.types?.includes(
                    "country"
                  )
              );

            const address = cleanAddress(
              result.formatted_address || ""
            );

            resolve({
              address,
              countryCode:
                country?.short_name?.toLowerCase() ||
                null,
            });
          }
        );
      }
    );
  };

  /*
   * Apply FROM location
   */
  const applyFromLocation = async (
    location,
    countryCode = null
  ) => {
    const previousCountry =
      fromCountryCodeRef.current;

    const nextCountry =
      countryCode ||
      previousCountry ||
      null;

    setLocationError("");

    /*
     * Update the Google input immediately
     */
    setAutocompleteValue(
      fromAutocompleteRef,
      location.address
    );

    /*
     * Update country
     */
    fromCountryCodeRef.current =
      nextCountry;

    setFromCountryCode(nextCountry);

    /*
     * Update parent OfferRide state
     */
    onFromChangeRef.current(location);

    /*
     * If country changed,
     * clear destination.
     */
    if (
      previousCountry &&
      nextCountry &&
      previousCountry !== nextCountry
    ) {
      setAutocompleteValue(
        destinationAutocompleteRef,
        ""
      );

      onDestinationChangeRef.current({
        ...EMPTY_LOCATION,
      });
    }

    /*
     * Move map
     */
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: location.latitude,
        lng: location.longitude,
      });

      mapRef.current.setZoom(12);
    }

    /*
     * After choosing From,
     * next map click should normally
     * be destination.
     */
    setMapTarget("destination");
  };

  /*
   * Apply DESTINATION location
   */
  const applyDestinationLocation = (
    location,
    countryCode = null
  ) => {
    const selectedCountry =
      countryCode?.toLowerCase() || null;

    const currentFromCountry =
      fromCountryCodeRef.current;

    /*
     * Do not allow destination before From
     */
    if (!currentFromCountry) {
      setLocationError(
        "Please select the From location first."
      );

      return false;
    }

    /*
     * Make sure destination belongs
     * to same country as From.
     */
    if (
      selectedCountry &&
      selectedCountry !==
        currentFromCountry
    ) {
      setLocationError(
        "Destination must be in the same country as the From location."
      );

      return false;
    }

    setLocationError("");

    /*
     * Update Google input immediately
     */
    setAutocompleteValue(
      destinationAutocompleteRef,
      location.address
    );

    /*
     * Update parent
     */
    onDestinationChangeRef.current(
      location
    );

    /*
     * Move map
     */
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: location.latitude,
        lng: location.longitude,
      });

      mapRef.current.setZoom(8);
    }

    setMapTarget("from");

    return true;
  };

  /*
   * Create Google Places autocomplete
   */
  useEffect(() => {
    if (!isLoaded) return;

    let fromListener = null;
    let destinationListener = null;

    let cancelled = false;

    const setupAutocomplete =
      async () => {
        try {
          const {
            PlaceAutocompleteElement,
          } =
            await window.google.maps.importLibrary(
              "places"
            );

          if (cancelled) return;

          /*
           * ==========================
           * FROM AUTOCOMPLETE
           * ==========================
           */

          const fromAutocomplete =
            new PlaceAutocompleteElement();

          fromAutocomplete.placeholder =
            "Search pickup location";

          /*
           * Allow India + US initially
           */
          fromAutocomplete.includedRegionCodes =
            ["us", "in"];

          fromAutocomplete.style.width =
            "100%";

          /*
           * Set existing value when editing
           */
          fromAutocomplete.value =
            fromLocation?.address || "";

          fromAutocompleteRef.current =
            fromAutocomplete;

          if (fromRef.current) {
            fromRef.current.innerHTML = "";

            fromRef.current.appendChild(
              fromAutocomplete
            );
          }

          fromListener =
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
                    cleanAddress(
                      place.formattedAddress ||
                        place.displayName ||
                        ""
                    );

                  const countryCode =
                    getCountryCodeFromPlace(
                      place
                    );

                  const location = {
                    address,
                    latitude:
                      place.location.lat(),
                    longitude:
                      place.location.lng(),
                  };

                  await applyFromLocation(
                    location,
                    countryCode
                  );
                } catch (error) {
                  console.error(
                    "From location error:",
                    error
                  );
                }
              }
            );

          /*
           * ==========================
           * DESTINATION AUTOCOMPLETE
           * ==========================
           */

          const destinationAutocomplete =
            new PlaceAutocompleteElement();

          destinationAutocomplete.placeholder =
            "Search destination";

          destinationAutocomplete.includedRegionCodes =
            fromCountryCodeRef.current
              ? [
                  fromCountryCodeRef.current,
                ]
              : ["us", "in"];

          /*
           * Disable destination until
           * From is selected.
           */
          destinationAutocomplete.disabled =
            !hasFrom;

          destinationAutocomplete.style.width =
            "100%";

          /*
           * Existing destination
           */
          destinationAutocomplete.value =
            destinationLocation?.address || "";

          destinationAutocompleteRef.current =
            destinationAutocomplete;

          if (destinationRef.current) {
            destinationRef.current.innerHTML =
              "";

            destinationRef.current.appendChild(
              destinationAutocomplete
            );
          }

          destinationListener =
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
                    cleanAddress(
                      place.formattedAddress ||
                        place.displayName ||
                        ""
                    );

                  const countryCode =
                    getCountryCodeFromPlace(
                      place
                    );

                  const location = {
                    address,
                    latitude:
                      place.location.lat(),
                    longitude:
                      place.location.lng(),
                  };

                  applyDestinationLocation(
                    location,
                    countryCode
                  );
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
      cancelled = true;

      /*
       * Clear DOM
       */
      if (fromRef.current) {
        fromRef.current.innerHTML = "";
      }

      if (destinationRef.current) {
        destinationRef.current.innerHTML =
          "";
      }

      fromAutocompleteRef.current = null;
      destinationAutocompleteRef.current =
        null;
    };

    /*
     * IMPORTANT:
     * Do not put form callbacks or map
     * state in these dependencies.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  /*
   * ==========================
   * KEEP GOOGLE INPUTS IN SYNC
   * ==========================
   *
   * This fixes the main issue:
   *
   * React state changes
   *        ↓
   * Google custom input updates
   */
  useEffect(() => {
    setAutocompleteValue(
      fromAutocompleteRef,
      fromLocation?.address || ""
    );
  }, [fromLocation?.address]);

  useEffect(() => {
    setAutocompleteValue(
      destinationAutocompleteRef,
      destinationLocation?.address ||
        ""
    );
  }, [
    destinationLocation?.address,
  ]);

  /*
   * ==========================
   * COUNTRY RESTRICTION
   * ==========================
   *
   * Destination must use the same
   * country as From.
   */
  useEffect(() => {
    const autocomplete =
      destinationAutocompleteRef.current;

    if (!autocomplete) return;

    if (fromCountryCode) {
      autocomplete.includedRegionCodes =
        [fromCountryCode.toLowerCase()];

      autocomplete.disabled = false;

      autocomplete.placeholder =
        `Search destination in ${
          fromCountryCode.toUpperCase()
        }`;
    } else {
      autocomplete.includedRegionCodes =
        ["us", "in"];

      autocomplete.disabled = !hasFrom;

      autocomplete.placeholder =
        "Search destination";
    }
  }, [
    fromCountryCode,
    hasFrom,
  ]);

  /*
   * ==========================
   * FIND COUNTRY FOR EXISTING
   * FROM LOCATION
   * ==========================
   *
   * Useful when editing an existing ride.
   */
  useEffect(() => {
    if (
      !isLoaded ||
      !hasFrom ||
      fromCountryCodeRef.current
    ) {
      return;
    }

    let cancelled = false;

    const findCountry = async () => {
      try {
        const result =
          await reverseGeocode(
            fromLocation.latitude,
            fromLocation.longitude
          );

        if (cancelled) return;

        if (result.countryCode) {
          fromCountryCodeRef.current =
            result.countryCode;

          setFromCountryCode(
            result.countryCode
          );
        }

        /*
         * Also clean an old Plus Code
         * from an existing address.
         */
        if (
          result.address &&
          result.address !==
            fromLocation.address
        ) {
          setAutocompleteValue(
            fromAutocompleteRef,
            result.address
          );
        }
      } catch (error) {
        console.error(
          "Unable to determine From country:",
          error
        );
      }
    };

    findCountry();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    hasFrom,
    fromLocation?.latitude,
    fromLocation?.longitude,
  ]);

  /*
   * ==========================
   * RESET COUNTRY WHEN FROM
   * IS CLEARED
   * ==========================
   */
  useEffect(() => {
    if (!hasFrom) {
      fromCountryCodeRef.current =
        null;

      setFromCountryCode(null);

      setAutocompleteValue(
        fromAutocompleteRef,
        ""
      );

      setAutocompleteValue(
        destinationAutocompleteRef,
        ""
      );
    }
  }, [hasFrom]);

  /*
   * ==========================
   * MAP CLICK
   * ==========================
   */
  const handleMapClick = async (
    event
  ) => {
    if (!event.latLng) return;

    const latitude =
      event.latLng.lat();

    const longitude =
      event.latLng.lng();

    try {
      const result =
        await reverseGeocode(
          latitude,
          longitude
        );

      const location = {
        address: result.address,
        latitude,
        longitude,
      };

      if (mapTarget === "from") {
        await applyFromLocation(
          location,
          result.countryCode
        );
      } else {
        applyDestinationLocation(
          location,
          result.countryCode
        );
      }
    } catch (error) {
      console.error(
        "Map click location error:",
        error
      );

      setLocationError(
        "Unable to get the address for this location."
      );
    }
  };

  /*
   * ==========================
   * FROM MARKER DRAG
   * ==========================
   */
  const handleFromMarkerDragEnd =
    async (event) => {
      if (!event.latLng) return;

      const latitude =
        event.latLng.lat();

      const longitude =
        event.latLng.lng();

      try {
        const result =
          await reverseGeocode(
            latitude,
            longitude
          );

        const location = {
          address: result.address,
          latitude,
          longitude,
        };

        await applyFromLocation(
          location,
          result.countryCode
        );
      } catch (error) {
        console.error(
          "From marker drag error:",
          error
        );

        setLocationError(
          "Unable to get the address for this location."
        );
      }
    };

  /*
   * ==========================
   * DESTINATION MARKER DRAG
   * ==========================
   */
  const handleDestinationMarkerDragEnd =
    async (event) => {
      if (!event.latLng) return;

      const latitude =
        event.latLng.lat();

      const longitude =
        event.latLng.lng();

      try {
        const result =
          await reverseGeocode(
            latitude,
            longitude
          );

        const location = {
          address: result.address,
          latitude,
          longitude,
        };

        applyDestinationLocation(
          location,
          result.countryCode
        );
      } catch (error) {
        console.error(
          "Destination marker drag error:",
          error
        );

        setLocationError(
          "Unable to get the address for this location."
        );
      }
    };

  /*
   * ==========================
   * ROUTE CALCULATION
   * ==========================
   */
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
              window.google.maps.UnitSystem
                .METRIC,
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

        const route =
          result.routes[0];

        /*
         * Distance in KM
         */
        const distanceKm =
          route.distanceMeters / 1000;

        /*
         * Duration in minutes
         */
        const durationMinutes =
          route.durationMillis / 60000;

        const hours =
          Math.floor(
            durationMinutes / 60
          );

        const minutes =
          Math.round(
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

          durationMinutes:
            Math.round(
              durationMinutes
            ),

          formattedDuration,
        };

        setRouteInfo(info);

        /*
         * Send numeric values to OfferRide
         */
        onRouteCalculatedRef.current?.(
          info
        );

        if (route.path) {
          setRoutePath(route.path);
        } else {
          setRoutePath([]);
        }

        /*
         * Fit map to route
         */
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

        setRouteInfo(null);
        setRoutePath([]);

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
    hasFrom,
    hasDestination,
    fromLocation?.latitude,
    fromLocation?.longitude,
    destinationLocation?.latitude,
    destinationLocation?.longitude,
  ]);

  /*
   * ==========================
   * MAP CENTER
   * ==========================
   */
  const center = hasFrom
    ? {
        lat: fromLocation.latitude,
        lng: fromLocation.longitude,
      }
    : defaultCenter;

  /*
   * ==========================
   * GOOGLE MAPS ERRORS
   * ==========================
   */
  if (loadError) {
    return (
      <div
        style={{
          color: "red",
          padding: "10px",
        }}
      >
        Google Maps failed to load.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          padding: "10px",
        }}
      >
        Loading map...
      </div>
    );
  }

  /*
   * ==========================
   * UI
   * ==========================
   */
  return (
    <div>
      {/* ==========================
          SEARCH FIELDS
          ========================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {/* FROM */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            From
          </label>

          <div ref={fromRef} />
        </div>

        {/* DESTINATION */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            Destination
          </label>

          <div ref={destinationRef} />
        </div>
      </div>

      {/* ==========================
          MAP TARGET BUTTONS
          ========================== */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setMapTarget("from");
            setLocationError("");
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border:
              mapTarget === "from"
                ? "2px solid #E8650A"
                : "1px solid #ccc",
            background:
              mapTarget === "from"
                ? "#fff3eb"
                : "#fff",
            cursor: "pointer",
          }}
        >
          📍 Set From on Map
        </button>

        <button
          type="button"
          disabled={!hasFrom}
          onClick={() => {
            setMapTarget("destination");
            setLocationError("");
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border:
              mapTarget === "destination"
                ? "2px solid #E8650A"
                : "1px solid #ccc",
            background:
              mapTarget === "destination"
                ? "#fff3eb"
                : "#fff",
            cursor: hasFrom
              ? "pointer"
              : "not-allowed",
            opacity: hasFrom ? 1 : 0.5,
          }}
        >
          📍 Set Destination on Map
        </button>
      </div>

      {/* ==========================
          INSTRUCTION
          ========================== */}
      <div
        style={{
          marginBottom: "10px",
          fontSize: "14px",
          color: "#666",
        }}
      >
        {mapTarget === "from"
          ? "Click on the map or drag the From marker to choose the pickup location."
          : "Click on the map or drag the Destination marker to choose the destination."}
      </div>

      {/* ==========================
          ERROR
          ========================== */}
      {locationError && (
        <div
          style={{
            color: "#d32f2f",
            marginBottom: "10px",
            fontSize: "14px",
          }}
        >
          {locationError}
        </div>
      )}

      {/* ==========================
          MAP
          ========================== */}
      <GoogleMap
        mapContainerStyle={
          containerStyle
        }
        center={center}
        zoom={hasFrom ? 10 : 6}
        onLoad={(mapInstance) => {
          mapRef.current =
            mapInstance;

          setMap(mapInstance);
        }}
        onUnmount={() => {
          mapRef.current = null;
          setMap(null);
        }}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* ==========================
            FROM MARKER
            ========================== */}
        {hasFrom && (
          <Marker
            position={{
              lat:
                fromLocation.latitude,
              lng:
                fromLocation.longitude,
            }}
            draggable={true}
            onClick={() => {
              setMapTarget("from");
              setLocationError("");
            }}
            onDragEnd={
              handleFromMarkerDragEnd
            }
          />
        )}

        {/* ==========================
            DESTINATION MARKER
            ========================== */}
        {hasDestination && (
          <Marker
            position={{
              lat:
                destinationLocation.latitude,
              lng:
                destinationLocation.longitude,
            }}
            draggable={true}
            onClick={() => {
              setMapTarget(
                "destination"
              );
              setLocationError("");
            }}
            onDragEnd={
              handleDestinationMarkerDragEnd
            }
          />
        )}

        {/* ==========================
            ROUTE
            ========================== */}
        {routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>

      {/* ==========================
          ROUTE INFORMATION
          ========================== */}
      {routeInfo && (
        <div
          style={{
            display: "flex",
            gap: "30px",
            marginTop: "15px",
            padding: "12px",
            borderRadius: "8px",
            background: "#f7f7f7",
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