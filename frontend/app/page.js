"use client";

import Chat from '@/components/Chat'
import NotLoggedIn from '@/components/NotLoggedIn'
import { useEffect, useState } from "react"
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import { useSession } from 'next-auth/react'


export default function Home() {

    const [adjustedHeight, setAdjustedHeight] = useState('93vh')
    const [loggedIn, setLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    const { data: session, status } = useSession()
    const not_expired = session && new Date(session.expires).getTime() > Date.now()


  
  useEffect(() => {
    const nav = document.getElementById('nav')
    if (nav) {
      const vh = (nav.offsetHeight / screen.height) * 100
      setAdjustedHeight((98 - vh) + 'vh')
    }

  }, [])
    
    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center m-12">
                <ClipLoader color="#96f4a2" size="150px" />
            </div>
        )
    } else if (status === "authenticated" && not_expired) {
        return (
            <div className="flex flex-col items-center" style={{height: adjustedHeight}}>
                <Chat />
            </div>
        )
    } else {
        return <NotLoggedIn />
    }
}
