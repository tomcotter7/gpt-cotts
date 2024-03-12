"use client";
import Chat from '@/components/Chat'
import { Settings } from '@/components/Settings'
import { useEffect, useState } from "react"
import axios from 'axios'

export default function Home() {

  const [adjustedHeight, setAdjustedHeight] = useState('93vh')

  
  useEffect(() => {
    const nav = document.getElementById('nav')
    if (nav) {
      const vh = (nav.offsetHeight / screen.height) * 100
      setAdjustedHeight((98 - vh) + 'vh')
    }
  }, [])

  function onLoginButtonClicked() {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`).then((res) => {
      window.location = res.data.url;
    })
  }

  

  return (
    <div className="flex flex-col items-center" style={{height: adjustedHeight}}>
      <Chat />
    </div>
  )
}
