import React, { createContext, useState } from 'react';

export interface UserContextType {
  userName: string;
  location: string;
  setLocation: (location: string) => void;
  setUserName: (name: string) => void;
}

export const UserContext = createContext<UserContextType>({
  userName: 'Demo',
  location: '',
  setLocation: () => {},
  setUserName: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState('Select Location');
  const [userName, setUserName] = useState('Demo');

  return (
    <UserContext.Provider value={{ userName, location, setLocation, setUserName }}>
      {children}
    </UserContext.Provider>
  );
};