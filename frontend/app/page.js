"use client";
import Chat from '@/components/Chat'
import NotLoggedIn from '@/components/NotLoggedIn'
import { useEffect, useState } from "react"
import axios from 'axios'
import { ClipLoader } from 'react-spinners'

export default function Home() {

    const [adjustedHeight, setAdjustedHeight] = useState('93vh')
    const [loggedIn, setLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

  
  useEffect(() => {
    const nav = document.getElementById('nav')
    if (nav) {
      const vh = (nav.offsetHeight / screen.height) * 100
      setAdjustedHeight((98 - vh) + 'vh')
    }

    if (localStorage.getItem('authToken') !== null) {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${localStorage.getItem('authToken')}`)
        const requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/me`, requestOptions).then(response => {
            if (response.ok) {
                setLoggedIn(true)
                setLoading(false)
            } else {
                setLoggedIn(false)
                setLoading(false)
            }
        }).catch(error => {
            setLoggedIn(false)
            setLoading(false)
        })
    } else {
        setLoading(false)
    }
  }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center m-12">
                <ClipLoader color="#96f4a2" size="150px" />
            </div>
        )
    }

    
    if (!loggedIn) {
        return <NotLoggedIn />
    }
    else {
        return (
            <div className="flex flex-col items-center" style={{height: adjustedHeight}}>
                <Chat />
            </div>
        )
    }
}
