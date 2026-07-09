import { createContext, useContext, useState } from "react";

const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [refreshRide, setRefreshRide] = useState(false);

  const refreshRides = () => {
    setRefreshRide((prev) => !prev);
  };

  return (
    <RideContext.Provider value={{ refreshRide, refreshRides }}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);