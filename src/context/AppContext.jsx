import React, { createContext, useContext, useState } from "react";
import { rides as mockRides } from "../data/mockData.jsx";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [rides, setRides] = useState(mockRides);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppContext.Provider
      value={{
        rides,
        setRides,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
};