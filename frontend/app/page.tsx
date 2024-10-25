"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { ClipLoader } from 'react-spinners';

// import { AlertBanner } from '@/components/AlertBanner';
import { NotLoggedIn } from '@/components/NotLoggedIn';
import { Chat } from '@/components/Chat';
import { ToastProvider } from '@/providers/Toast';

export default function Home() {
    
    const { data: session, status } = useSession();
    const [adjustedHeight, setAdjustedHeight] = useState('93vh')
    const [valid, setValid] = useState(true)

    useEffect(() => {
        const nav = document.getElementById('nav')
        if (nav) {
          const vh = (nav.offsetHeight / screen.height) * 100
          setAdjustedHeight((98 - vh) + 'vh')
        }

    }, [])

    useEffect(() => {
        async function getValidity() {
            
            if (!session) {
                return;
            }

            const requestOptions = {
                'method': 'GET',
                'headers': {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'accept': 'application/json'
                }
            }   

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user_data/validate`, requestOptions)

            if (response.status !== 200) {
                window.location.href = "/api/auth/signout/google"
                return;
            }

            const data = await response.json()
            if (!data.valid) { setValid(data.valid) }
        }

        getValidity()

    }, [status])

    if ( status === "loading" ) {
        return (
            <div className="flex justify-center m-4">
                    <ClipLoader color="#fcbe6a" size="10vh" />
                </div>
            )
    } else if (!session || status !== "authenticated") {
        return <NotLoggedIn />
    } else {
        return (
            <ToastProvider>
                <div className="flex justify-center" style={{height: adjustedHeight}}>
                    { /** <AlertBanner /> **/ }
                    <Chat valid={valid} />
                </div>
            </ToastProvider>
        )

    }
}

