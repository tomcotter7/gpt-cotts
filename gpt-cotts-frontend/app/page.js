"use client";
import Chat from '@/components/Chat'
import { Settings } from '@/components/Settings'
import { useState } from "react"

export default function Home() {
  
  const [settings, setSettings] = useState({
    rag: false,
    animalese: false
  })

  function handleSettingsChange(newSettings) {
    setSettings(newSettings)
  }

  return (
    <>
      <div className="flex justify-end m-3">
        <Settings
          onSettingsChange={handleSettingsChange}
          />
      </div>
      <Chat settings={settings}/>
    </>
  )
}
