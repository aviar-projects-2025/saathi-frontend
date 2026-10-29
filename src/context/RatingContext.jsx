import React, {
  createContext, useContext, useEffect, useState, useRef, useCallback,
} from "react";
import axios from "axios";
import Api from "../Api";
import RideRatingReportModal from "../pages/RideRatingReportModal";
import { useUser } from "./userConetext";
import socket from "../socket";

const RatingContext = createContext();
export const useRating = () => useContext(RatingContext);

const DISMISS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const readRated = (userId) => {
  try { return new Set(JSON.parse(localStorage.getItem(`ratedRides_${userId}`) || "[]")); }
  catch { return new Set(); }
};
const readDismissed = (userId) => {
  try { return JSON.parse(localStorage.getItem(`dismissedRides_${userId}`) || "{}"); }
  catch { return {}; }
};

export const RatingProvider = ({ children }) => {
  const { currentUser } = useUser();
  const currentUserId = currentUser?.id || currentUser?._id;

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingRide, setRatingRide] = useState(null);
  const [ratingTargetUser, setRatingTargetUser] = useState(null);

  const checkingRef = useRef(false);

  // ───────────────────────────────────────────────────────────
  // Persist rated rides
  // ───────────────────────────────────────────────────────────
  const markRated = useCallback((rideId) => {
    if (!rideId || !currentUserId) return;
    const key = `ratedRides_${currentUserId}`;
    try {
      const existing = new Set(JSON.parse(localStorage.getItem(key) || "[]"));
      existing.add(rideId);
      localStorage.setItem(key, JSON.stringify([...existing]));
    } catch {}
  }, [currentUserId]);

  // ───────────────────────────────────────────────────────────
  // Persist dismissals (3 days)
  // ───────────────────────────────────────────────────────────
  const markDismissed = useCallback((rideId) => {
    if (!rideId || !currentUserId) return;
    const key = `dismissedRides_${currentUserId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(key) || "{}");
      existing[rideId] = Date.now();
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
  }, [currentUserId]);

  // ───────────────────────────────────────────────────────────
  // Core check — runs on mount and socket events
  // ───────────────────────────────────────────────────────────
  const checkForUnratedRides = useCallback(async () => {
    if (!currentUserId) return;
    if (checkingRef.current) return;
    if (ratingModalOpen) return;

    const promptedKey = `ratingPrompted_${currentUserId}`;
    if (sessionStorage.getItem(promptedKey) === "1") return;

    checkingRef.current = true;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        `${Api}/rides/get?type=my&category=history&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rides = res.data?.data || [];
      const now = Date.now();
      const rated = readRated(currentUserId);
      const dismissed = readDismissed(currentUserId);

      // Find an unrated, un-dismissed, completed ride that has a valid counterparty
      let picked = null;
      let pickedTargetUser = null;

      for (const ride of rides) {
        if (ride.travelStatus !== "Completed") continue;
        if (ride.hasRated) continue;
        if (rated.has(ride._id)) continue;
        const dismissedAt = dismissed[ride._id];
        if (dismissedAt && now - dismissedAt < DISMISS_MS) continue;

        // Resolve the "other side" (counterparty) of this ride
        const ownerId = String(ride?.createdBy?._id || ride?.createdBy || "");
        const driverId = String(ride?.actualDriver?._id || ride?.actualDriver || "");
        const selfId = String(currentUserId);

        const isOwner = ownerId === selfId;
        const isDriver = driverId === selfId;

        let candidate = null;

        if (isDriver && !isOwner) {
          // I was the helper → rate the passenger (owner)
          candidate = ride.createdBy;
        } else if (isOwner && driverId && !isDriver) {
          // I'm the passenger, and there's a helper → rate the helper
          candidate = ride.actualDriver;
        } else if (isOwner && !driverId) {
          // I'm the owner, no helper → rate the first accepted passenger
          try {
            const bookingRes = await axios.get(
              `${Api}/bookride/${currentUserId}?type=received`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const bookings = bookingRes.data?.data || [];
            const accepted = bookings.find(
              (r) =>
                String(r.rideId?._id || r.rideId) === String(ride._id) &&
                r.status === "ACCEPTED"
            );
            if (accepted?.requestedBy) candidate = accepted.requestedBy;
          } catch (e) {
            console.warn("[RATING] could not fetch bookings", e.message);
          }
        }

        // ★ GUARD: skip if candidate is missing or is myself
        const candidateId = String(candidate?._id || candidate?.id || "");
        if (!candidate || !candidateId || candidateId === selfId) {
          console.log("[RATING] no valid counterparty — dismissing ride", {
            rideId: ride._id,
            ownerId,
            driverId,
            candidateId,
            selfId,
          });
          // Dismiss so we don't keep retrying the same ride
          markDismissed(ride._id);
          continue;
        }

        picked = ride;
        pickedTargetUser = candidate;
        break;
      }

      if (!picked) return;

      sessionStorage.setItem(promptedKey, "1");
      setRatingRide(picked);
      setRatingTargetUser(pickedTargetUser);
      setRatingModalOpen(true);
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.error("[GLOBAL RATING] check failed", err?.message);
      }
    } finally {
      checkingRef.current = false;
    }
  }, [currentUserId, ratingModalOpen, markDismissed]);

  // ───────────────────────────────────────────────────────────
  // Close handlers
  // ───────────────────────────────────────────────────────────
  const handleRatingSuccess = useCallback((rideId) => {
    markRated(rideId);
    setRatingModalOpen(false);
    setRatingRide(null);
    setRatingTargetUser(null);
  }, [markRated]);

  const handleLater = useCallback((rideId) => {
    if (rideId) markDismissed(rideId);
    setRatingModalOpen(false);
    setRatingRide(null);
    setRatingTargetUser(null);
  }, [markDismissed]);

  const handleModalClose = useCallback(() => {
    const rideId = ratingRide?._id;
    if (rideId) {
      const rated = currentUserId ? readRated(currentUserId) : new Set();
      if (!rated.has(rideId)) {
        markDismissed(rideId);
      }
    }
    setRatingModalOpen(false);
    setRatingRide(null);
    setRatingTargetUser(null);
  }, [ratingRide, currentUserId, markDismissed]);

  // ───────────────────────────────────────────────────────────
  // Effects
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    const t = setTimeout(checkForUnratedRides, 1500);
    return () => clearTimeout(t);
  }, [currentUserId, checkForUnratedRides]);

  useEffect(() => {
    if (!currentUserId) return;
    const onRideCompleted = () => checkForUnratedRides();
    socket.on("ride_completed", onRideCompleted);
    window.addEventListener("rideDataChanged", onRideCompleted);
    return () => {
      socket.off("ride_completed", onRideCompleted);
      window.removeEventListener("rideDataChanged", onRideCompleted);
    };
  }, [currentUserId, checkForUnratedRides]);

  return (
    <RatingContext.Provider value={{ triggerRatingCheck: checkForUnratedRides }}>
      {children}
      <RideRatingReportModal
        open={ratingModalOpen}
        onClose={handleModalClose}
        ride={ratingRide}
        targetUser={ratingTargetUser}
        onSuccess={handleRatingSuccess}
        onLater={handleLater}
      />
    </RatingContext.Provider>
  );
};