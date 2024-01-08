"use client";
import Chat from '@/components/Chat'
import { Settings } from '@/components/Settings'
import { useState } from "react"

export default function Home() {

  return (
    <div className="flex flex-col items-center w-screen">
      <Chat />
    </div>
  )
}
