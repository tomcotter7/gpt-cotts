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
    console.log("Received new settings", newSettings)
    setSettings(newSettings)
  }

  return (
    <>
      <div className="flex m-2">
        <div>
          <h1 className="text-4xl text-black">
            <u><b>gpt-cotts</b></u>
          </h1>
          <h2 className="text-fuchsia-500"> skill issues? use me </h2>
        </div>
        <div className="ml-auto">
          <Settings
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
      <Chat settings={settings}/>
    </>
  )
}
