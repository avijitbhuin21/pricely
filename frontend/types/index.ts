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

export interface HeaderProps {
  userName: string;
  currentLocation: string;
  onLocationSelect: (location: string) => void;
  onAutoLocate: () => void;
}

export interface Location {
  id: string;
  name: string;
  fullName?: string;
  isAutoLocate?: boolean;
}
