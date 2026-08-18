import { LocationTab } from '@/constants/locations';
import { createContext, ReactNode, useContext, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LocationsContextValue = {
  addedLocations: LocationTab[];
  addLocation: (location: LocationTab) => void;
  removeLocation: (id: string) => void;
};

const LocationsContext = createContext<LocationsContextValue | null>(null);

export function LocationsProvider({ children }: { children: ReactNode }) {
  const [addedLocations, setAddedLocations] = useState<LocationTab[]>([]);

  const addLocation = (location: LocationTab) => {
    setAddedLocations((prev) => {
      if (prev.some((loc) => loc.id === location.id)) return prev;
      return [...prev, location];
    });
  };

  const removeLocation = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAddedLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  return (
    <LocationsContext.Provider value={{ addedLocations, addLocation, removeLocation }}>
      {children}
    </LocationsContext.Provider>
  );
}

export function useLocations() {
  const ctx = useContext(LocationsContext);
  if (!ctx) throw new Error('useLocations는 LocationsProvider 안에서만 써야 해요');
  return ctx;
}