"use client";
import React, { createContext, useState, useContext } from 'react';
import { SettingsInterface } from '@/components/Settings';

type SettingsContextType = {
  settings: SettingsInterface
  updateSettings: (newSettings: Partial<SettingsInterface>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);


export function SettingsProvider({ children, initialSettings }: { children: React.ReactNode, initialSettings: SettingsInterface }) {
  const [settings, setSettings] = useState<SettingsInterface>(initialSettings);

  function updateSettings(newSettings: Partial<SettingsInterface>) {
    setSettings((prev) => {
      return { ...prev, ...newSettings }
    });
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
