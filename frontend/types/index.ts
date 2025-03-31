export interface SearchBarProps {
  onSearch: () => void;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
}

export interface SearchHistoryProps {
  searches: string[];
  onSearchPress: (item: string) => void;
  onClearHistory: () => void;
  onDeleteSearch: (item: string) => void;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}

export interface Location {
  address: string;
  lat?: number;
  lon?: number;
}

export interface LocationResult {
  id: string;
  description: string;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  fullName?: string;
  isAutoLocate?: boolean;
}

export interface HeaderProps {
  userName: string;
  currentLocation: Location;
  onLocationSelect: (location: Location) => void;
  onAutoLocate: () => void;
  showBackButton?: boolean;
  hideHamburger?: boolean;
}

export interface LocationContextType {
  currentLocation: Location;
  isLocating: boolean;
  googleApiKey: string | null;
  updateLocation: (location: Location) => void;
  autoLocate: () => Promise<void>;
  searchLocations: (query: string) => Promise<LocationResult[]>;
}

