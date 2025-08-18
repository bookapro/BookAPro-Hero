import { useCurrentGPSLocation } from "@/hooks/useCurrentGPSLocation";
import React, { createContext, ReactNode, useContext } from "react";

interface LocationContextType {
  currentLocation: any | null;
  errorMsg: string | null;
  loading: boolean;
  refetch: () => void;
}

const LocationContext = createContext<LocationContextType>({
  currentLocation: null,
  errorMsg: null,
  loading: true,
  refetch: () => {},
});

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const { gpsLocation, errorMsg, loading, refetch } = useCurrentGPSLocation();
  return (
    <LocationContext.Provider
      value={{ currentLocation: gpsLocation, errorMsg, loading, refetch }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
