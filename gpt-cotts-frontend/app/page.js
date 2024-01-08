"use client";
import Chat from '@/components/Chat'
import { Settings } from '@/components/Settings'
import { useEffect, useState } from "react"

export default function Home() {

  const [adjustedHeight, setAdjustedHeight] = useState(0)

  
  useEffect(() => {
    const nav = document.getElementById('nav')
    if (nav) {
      const vh = (nav.offsetHeight / screen.height) * 100
      if (screen.width < 640) {
        setAdjustedHeight((86 - vh) + 'vh')
      } else {
        setAdjustedHeight((98 - vh) + 'vh')
      }
    }
  }, [])

  

  return (
    <div className="flex flex-col items-center" style={{height: adjustedHeight}}>
      <Chat />
    </div>
  )
}
