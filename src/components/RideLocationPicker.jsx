import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  buildPublicLocationLabel,
  derivePublicLocationLabel,
  isInUSBox,
} from "../utils/location";

const libraries = ["places"];

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 39.5,
  lng: -98.35,
};

export default function RideLocationPicker({
  fromLocation,
  destinationLocation,
  onFromChange,
  ride,
  onDestinationChange,
  onRouteCalculated,
  disabled = false,
}) {
  const [map, setMap] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [fromCountryCode, setFromCountryCode] = useState(null);
  const [mapSelectionMode, setMapSelectionMode] = useState("from");
  const [userLocation, setUserLocation] = useState(null);
  const [selectionError, setSelectionError] = useState(""); // ★ TC-4

  const fromContainerRef = useRef(null);
  const destinationContainerRef = useRef(null);

  const fromAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  const mapRef = useRef(null);
  const geocoderRef = useRef(null);

  const onFromChangeRef = useRef(onFromChange);
  const onDestinationChangeRef = useRef(onDestinationChange);
  const onRouteCalculatedRef = useRef(onRouteCalculated);

  const fromCountryCodeRef = useRef(null);
  const initialRouteHandledRef = useRef(false);

  const resolvedFromAddress = fromLocation?.address || ride?.from || "";
  const resolvedDestinationAddress =
    destinationLocation?.address || ride?.destination || "";

  const fromAddressRef = useRef(resolvedFromAddress);
  const destinationAddressRef = useRef(resolvedDestinationAddress);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const hasFrom =
    fromLocation?.latitude != null && fromLocation?.longitude != null;
  const hasDestination =
    destinationLocation?.latitude != null &&
    destinationLocation?.longitude != null;

  useEffect(() => {
    fromAddressRef.current = resolvedFromAddress;
  }, [resolvedFromAddress]);

  useEffect(() => {
    destinationAddressRef.current = resolvedDestinationAddress;
  }, [resolvedDestinationAddress]);

  useEffect(() => {
    onFromChangeRef.current = onFromChange;
  }, [onFromChange]);

  useEffect(() => {
    onDestinationChangeRef.current = onDestinationChange;
  }, [onDestinationChange]);

  useEffect(() => {
    onRouteCalculatedRef.current = onRouteCalculated;
  }, [onRouteCalculated]);

  useEffect(() => {
    if (hasFrom || disabled) {
      setUserLocation(null);
      return;
    }
    if (!navigator.geolocation) {
      setUserLocation(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.log("User location unavailable:", error.message);
        setUserLocation(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [hasFrom, disabled]);

  const formatDuration = (durationMinutes) => {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.round(durationMinutes % 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  };

  const kmToMiles = (km) => {
    if (km == null || Number.isNaN(Number(km))) return null;
    return Number(km) * 0.621371;
  };

  const setAutocompleteValue = (autocompleteRef, value) => {
    if (!autocompleteRef.current) return;
    const element = autocompleteRef.current;
    const input = element.shadowRoot?.querySelector("input");
    if (input) {
      input.value = value || "";
    } else {
      element.value = value || "";
    }
  };

  const getCountryFromPlace = (place) => {
    const country = place?.addressComponents?.find((component) =>
      component.types?.includes("country")
    );
    // Web SDK uses shortText; REST uses short_name. Accept both.
    return (
      country?.shortText?.toLowerCase() ||
      country?.short_name?.toLowerCase() ||
      null
    );
  };

  const getCountryFromGeocoder = (result) => {
    const country = result?.address_components?.find((component) =>
      component.types?.includes("country")
    );
    return country?.short_name?.toLowerCase() || null;
  };

  const reverseGeocode = (latitude, longitude) => {
    return new Promise((resolve) => {
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }
      geocoderRef.current.geocode(
        { location: { lat: latitude, lng: longitude } },
        (results, status) => {
          if (status !== "OK" || !results || results.length === 0) {
            console.error("Reverse geocode failed:", status);
            resolve(null);
            return;
          }
          const result = results[0];
          // ★ TC-1: also return the public label alongside the street address
          const publicAddress = buildPublicLocationLabel({
            addressComponents: result.address_components || [],
            name: (result.formatted_address || "").split(",")[0] || "",
            types: result.types || [],
          });
          resolve({
            address: result.formatted_address || "",
            publicAddress,
            countryCode: getCountryFromGeocoder(result),
          });
        }
      );
    });
  };

  const updateFromLocation = async (latitude, longitude) => {
    if (disabled) return;
    setSelectionError("");

    // ★ TC-4: reject non-US coordinates from map click / drag
    if (!isInUSBox(latitude, longitude)) {
      setSelectionError("Please pick a location inside the United States.");
      return;
    }

    try {
      const result = await reverseGeocode(latitude, longitude);
      if (!result) return;

      // ★ TC-4: the bounding box passed but the geocoder says it's not US
      if (result.countryCode && result.countryCode !== "us") {
        setSelectionError("Please pick a location inside the United States.");
        return;
      }

      const newCountryCode = result.countryCode;
      const oldCountryCode = fromCountryCodeRef.current;

      if (oldCountryCode && newCountryCode && oldCountryCode !== newCountryCode) {
        const emptyDestination = {
          address: "",
          publicAddress: "",
          latitude: null,
          longitude: null,
        };
        onDestinationChangeRef.current?.(emptyDestination);
        setAutocompleteValue(destinationAutocompleteRef, "");
        setRoutePath([]);
        setRouteInfo(null);
        onRouteCalculatedRef.current?.(null);
      }

      fromCountryCodeRef.current = newCountryCode;
      setFromCountryCode(newCountryCode);

      const location = {
        address: result.address,
        publicAddress:
          result.publicAddress ||
          derivePublicLocationLabel(result.address),
        latitude,
        longitude,
      };

      setAutocompleteValue(fromAutocompleteRef, result.address);
      onFromChangeRef.current?.(location);

      setMapSelectionMode("destination");

      if (mapRef.current) {
        mapRef.current.panTo({ lat: latitude, lng: longitude });
        mapRef.current.setZoom(10);
      }
    } catch (error) {
      console.error("Failed to update From location:", error);
    }
  };

  const updateDestinationLocation = async (latitude, longitude) => {
    if (disabled) return;
    setSelectionError("");

    // ★ TC-4
    if (!isInUSBox(latitude, longitude)) {
      setSelectionError("Please pick a location inside the United States.");
      return;
    }

    try {
      const result = await reverseGeocode(latitude, longitude);
      if (!result) return;

      // ★ TC-4
      if (result.countryCode && result.countryCode !== "us") {
        setSelectionError("Please pick a location inside the United States.");
        return;
      }

      const selectedCountry = result.countryCode;
      const currentFromCountry = fromCountryCodeRef.current;

      if (
        currentFromCountry &&
        selectedCountry &&
        currentFromCountry !== selectedCountry
      ) {
        setSelectionError(
          "Destination must be in the same country as the From location."
        );
        return;
      }

      const location = {
        address: result.address,
        publicAddress:
          result.publicAddress ||
          derivePublicLocationLabel(result.address),
        latitude,
        longitude,
      };

      setAutocompleteValue(destinationAutocompleteRef, result.address);
      onDestinationChangeRef.current?.(location);

      setMapSelectionMode("destination");

      if (mapRef.current) {
        mapRef.current.panTo({ lat: latitude, lng: longitude });
        mapRef.current.setZoom(7);
      }
    } catch (error) {
      console.error("Failed to update Destination location:", error);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    const setupAutocomplete = async () => {
      try {
        const { PlaceAutocompleteElement } =
          await window.google.maps.importLibrary("places");

        if (cancelled) return;

        const fromAutocomplete = new PlaceAutocompleteElement();
        fromAutocomplete.placeholder = disabled ? "" : "Search pickup location";
        // ★ TC-4: US only
        fromAutocomplete.includedRegionCodes = ["us"];
        fromAutocomplete.style.width = "100%";

        if (disabled) {
          fromAutocomplete.style.pointerEvents = "none";
          fromAutocomplete.style.opacity = "0.7";
        }

        fromAutocompleteRef.current = fromAutocomplete;

        if (fromContainerRef.current) {
          fromContainerRef.current.innerHTML = "";
          fromContainerRef.current.appendChild(fromAutocomplete);
        }

        setAutocompleteValue(fromAutocompleteRef, fromAddressRef.current);

        fromAutocomplete.addEventListener("gmp-select", async (event) => {
          if (disabled) return;
          setSelectionError("");
          try {
            const place = event.placePrediction.toPlace();
            await place.fetchFields({
              fields: [
                "displayName",
                "formattedAddress",
                "location",
                "addressComponents",
                "types",
              ],
            });
            if (!place.location) return;

            const address = place.formattedAddress || place.displayName || "";
            const latitude = place.location.lat();
            const longitude = place.location.lng();
            const countryCode = getCountryFromPlace(place);

            // ★ TC-4: reject non-US selections
            if (countryCode && countryCode !== "us") {
              setSelectionError(
                "Saathi rides are US-only. Please pick a US location."
              );
              setAutocompleteValue(fromAutocompleteRef, "");
              return;
            }

            const publicAddress = buildPublicLocationLabel({
              addressComponents: place.addressComponents || [],
              name: place.displayName || "",
              types: place.types || [],
            });

            const oldCountry = fromCountryCodeRef.current;
            if (oldCountry && countryCode && oldCountry !== countryCode) {
              onDestinationChangeRef.current?.({
                address: "",
                publicAddress: "",
                latitude: null,
                longitude: null,
              });
              setAutocompleteValue(destinationAutocompleteRef, "");
              setRoutePath([]);
              setRouteInfo(null);
              onRouteCalculatedRef.current?.(null);
            }

            fromCountryCodeRef.current = countryCode;
            setFromCountryCode(countryCode);

            onFromChangeRef.current?.({
              address,
              publicAddress:
                publicAddress || derivePublicLocationLabel(address),
              latitude,
              longitude,
            });

            if (mapRef.current) {
              mapRef.current.panTo({ lat: latitude, lng: longitude });
              mapRef.current.setZoom(10);
            }

            setMapSelectionMode("destination");
          } catch (error) {
            console.error("From selection error:", error);
          }
        });

        const destinationAutocomplete = new PlaceAutocompleteElement();
        destinationAutocomplete.placeholder = disabled ? "" : "Search destination";
        destinationAutocomplete.includedRegionCodes = ["us"]; // ★ TC-4
        destinationAutocomplete.style.width = "100%";

        if (disabled) {
          destinationAutocomplete.style.pointerEvents = "none";
          destinationAutocomplete.style.opacity = "0.7";
        }

        destinationAutocompleteRef.current = destinationAutocomplete;

        if (destinationContainerRef.current) {
          destinationContainerRef.current.innerHTML = "";
          destinationContainerRef.current.appendChild(destinationAutocomplete);
        }

        setAutocompleteValue(
          destinationAutocompleteRef,
          destinationAddressRef.current
        );

        destinationAutocomplete.addEventListener("gmp-select", async (event) => {
          if (disabled) return;
          setSelectionError("");
          try {
            const place = event.placePrediction.toPlace();
            await place.fetchFields({
              fields: [
                "displayName",
                "formattedAddress",
                "location",
                "addressComponents",
                "types",
              ],
            });
            if (!place.location) return;

            const address = place.formattedAddress || place.displayName || "";
            const latitude = place.location.lat();
            const longitude = place.location.lng();
            const countryCode = getCountryFromPlace(place);

            // ★ TC-4
            if (countryCode && countryCode !== "us") {
              setSelectionError(
                "Saathi rides are US-only. Please pick a US location."
              );
              setAutocompleteValue(destinationAutocompleteRef, "");
              return;
            }

            const currentFromCountry = fromCountryCodeRef.current;
            if (
              currentFromCountry &&
              countryCode &&
              currentFromCountry !== countryCode
            ) {
              setSelectionError(
                "Destination must be in the same country as the From location."
              );
              setAutocompleteValue(destinationAutocompleteRef, "");
              return;
            }

            const publicAddress = buildPublicLocationLabel({
              addressComponents: place.addressComponents || [],
              name: place.displayName || "",
              types: place.types || [],
            });

            onDestinationChangeRef.current?.({
              address,
              publicAddress:
                publicAddress || derivePublicLocationLabel(address),
              latitude,
              longitude,
            });

            if (mapRef.current) {
              mapRef.current.panTo({ lat: latitude, lng: longitude });
              mapRef.current.setZoom(7);
            }

            setMapSelectionMode("destination");
          } catch (error) {
            console.error("Destination selection error:", error);
          }
        });
      } catch (error) {
        console.error("Autocomplete setup failed:", error);
      }
    };

    setupAutocomplete();

    return () => {
      cancelled = true;
      if (fromContainerRef.current) fromContainerRef.current.innerHTML = "";
      if (destinationContainerRef.current)
        destinationContainerRef.current.innerHTML = "";
      fromAutocompleteRef.current = null;
      destinationAutocompleteRef.current = null;
    };
  }, [isLoaded, disabled]);

  useEffect(() => {
    const autocomplete = destinationAutocompleteRef.current;
    if (!autocomplete) return;
    // ★ TC-4: US-only, no fallback to "in"
    autocomplete.includedRegionCodes = ["us"];
    autocomplete.placeholder = disabled ? "" : "Search destination";
  }, [fromCountryCode, disabled]);

  useEffect(() => {
    if (!isLoaded || !hasFrom || fromCountryCodeRef.current) return;
    let cancelled = false;
    const detectCountry = async () => {
      const result = await reverseGeocode(
        fromLocation.latitude,
        fromLocation.longitude
      );
      if (cancelled || !result?.countryCode) return;
      fromCountryCodeRef.current = result.countryCode;
      setFromCountryCode(result.countryCode);
      setAutocompleteValue(
        fromAutocompleteRef,
        fromLocation.address || ride?.from
      );
      setAutocompleteValue(
        destinationAutocompleteRef,
        destinationLocation?.address || ride?.destination
      );
    };
    detectCountry();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, hasFrom, fromLocation?.latitude, fromLocation?.longitude]);

  useEffect(() => {
    if (!isLoaded) return;
    if (resolvedFromAddress) {
      setAutocompleteValue(fromAutocompleteRef, resolvedFromAddress);
    }
  }, [isLoaded, resolvedFromAddress]);

  useEffect(() => {
    if (!isLoaded) return;
    if (resolvedDestinationAddress) {
      setAutocompleteValue(destinationAutocompleteRef, resolvedDestinationAddress);
    }
  }, [isLoaded, resolvedDestinationAddress]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!hasFrom || !hasDestination) {
      setRoutePath([]);
      setRouteInfo(null);
      onRouteCalculatedRef.current?.(null);
      return;
    }

    let cancelled = false;

    const isInitialEditLoad =
      !initialRouteHandledRef.current &&
      ride?.distanceKm != null &&
      ride?.duration != null;

    const calculateRoute = async () => {
      try {
        const { Route } = await window.google.maps.importLibrary("routes");
        const result = await Route.computeRoutes({
          origin: {
            lat: fromLocation.latitude,
            lng: fromLocation.longitude,
          },
          destination: {
            lat: destinationLocation.latitude,
            lng: destinationLocation.longitude,
          },
          travelMode: "DRIVING",
          fields: ["distanceMeters", "durationMillis", "path", "viewport"],
          units: window.google.maps.UnitSystem.METRIC,
        });
        if (cancelled) return;

        if (isInitialEditLoad) {
          const savedInfo = {
            distanceKm: ride.distanceKm,
            durationMinutes: ride.duration,
            formattedDuration: formatDuration(ride.duration),
          };
          setRouteInfo(savedInfo);
          onRouteCalculatedRef.current?.(savedInfo);
          const route = result.routes?.[0];
          if (route?.path) setRoutePath(route.path);
          if (mapRef.current && route?.viewport) {
            mapRef.current.fitBounds(route.viewport, 50);
          }
          initialRouteHandledRef.current = true;
          return;
        }

        initialRouteHandledRef.current = true;

        if (!result.routes || result.routes.length === 0) {
          setRoutePath([]);
          setRouteInfo(null);
          onRouteCalculatedRef.current?.(null);
          return;
        }

        const route = result.routes[0];
        const distanceKm = route.distanceMeters / 1000;
        const durationMinutes = route.durationMillis / 60000;
        const info = {
          distanceKm: Number(distanceKm.toFixed(1)),
          durationMinutes: Math.round(durationMinutes),
          formattedDuration: formatDuration(durationMinutes),
        };
        setRouteInfo(info);
        onRouteCalculatedRef.current?.(info);
        if (route.path) setRoutePath(route.path);
        if (mapRef.current && route.viewport) {
          mapRef.current.fitBounds(route.viewport, 50);
        }
      } catch (error) {
        console.error("Route calculation failed:", error);
        if (isInitialEditLoad) {
          const savedInfo = {
            distanceKm: ride.distanceKm,
            durationMinutes: ride.duration,
            formattedDuration: formatDuration(ride.duration),
          };
          setRouteInfo(savedInfo);
          onRouteCalculatedRef.current?.(savedInfo);
          initialRouteHandledRef.current = true;
          return;
        }
        setRoutePath([]);
        setRouteInfo(null);
        onRouteCalculatedRef.current?.(null);
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

  const handleMapClick = async (event) => {
    if (disabled || !event.latLng) return;
    const latitude = event.latLng.lat();
    const longitude = event.latLng.lng();
    if (mapSelectionMode === "from") {
      await updateFromLocation(latitude, longitude);
    } else {
      await updateDestinationLocation(latitude, longitude);
    }
  };

  const handleFromMarkerDragEnd = async (event) => {
    if (disabled || !event.latLng) return;
    await updateFromLocation(event.latLng.lat(), event.latLng.lng());
  };

  const handleDestinationMarkerDragEnd = async (event) => {
    if (disabled || !event.latLng) return;
    await updateDestinationLocation(event.latLng.lat(), event.latLng.lng());
  };

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
  };

  const handleMapUnmount = () => {
    setMap(null);
    mapRef.current = null;
  };

  const center = hasFrom
    ? { lat: fromLocation.latitude, lng: fromLocation.longitude }
    : userLocation || defaultCenter;

  if (loadError) {
    return <div style={{ color: "red" }}>Google Maps failed to load.</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
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
            From
          </label>
          <div ref={fromContainerRef} />
        </div>

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

      {/* ★ TC-4: inline error for non-US picks */}
      {selectionError && (
        <div
          style={{
            marginBottom: "8px",
            padding: "8px 12px",
            background: "#FFF3E0",
            border: "1px solid #F5C896",
            borderRadius: "8px",
            color: "#7A4200",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {selectionError}
        </div>
      )}

      {!disabled && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "6px",
            }}
          >
            <strong style={{ fontSize: "14px" }}>Select on map:</strong>
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
                background: mapSelectionMode === "from" ? "#fff3eb" : "#fff",
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
                    ? "2px solid #E8650A"
                    : "1px solid #ccc",
                background:
                  mapSelectionMode === "destination" ? "#fff3eb" : "#fff",
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
            <strong>{mapSelectionMode === "from" ? "From" : "Destination"}</strong>
            . You can also drag either marker. US locations only.
          </div>
        </>
      )}

      {disabled && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
            fontSize: "13.5px",
            color: "#999",
            fontWeight: 600,
          }}
        >
          🔒 Route fixed from request
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={hasFrom ? 10 : 4}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: disabled ? "none" : "auto",
          draggable: !disabled,
          scrollwheel: !disabled,
          disableDoubleClickZoom: disabled,
        }}
      >
        {hasFrom && (
          <Marker
            position={{
              lat: fromLocation.latitude,
              lng: fromLocation.longitude,
            }}
            draggable={!disabled}
            onDragEnd={handleFromMarkerDragEnd}
            onClick={() => !disabled && setMapSelectionMode("from")}
          />
        )}
        {hasDestination && (
          <Marker
            position={{
              lat: destinationLocation.latitude,
              lng: destinationLocation.longitude,
            }}
            draggable={!disabled}
            onDragEnd={handleDestinationMarkerDragEnd}
            onClick={() => !disabled && setMapSelectionMode("destination")}
          />
        )}
        {routePath.length > 0 && (
          <Polyline path={routePath} options={{ strokeWeight: 5 }} />
        )}
      </GoogleMap>

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
            {kmToMiles(routeInfo.distanceKm)?.toFixed(1)} mi
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