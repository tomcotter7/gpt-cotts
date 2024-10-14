"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { ClipLoader } from 'react-spinners';

import { AlertBanner } from '@/components/AlertBanner';
import { NotLoggedIn } from '@/components/NotLoggedIn';
import { Chat } from '@/components/Chat';

export default function Home() {
    
    const { data: session, status } = useSession();
    void session;
    const [adjustedHeight, setAdjustedHeight] = useState('93vh')

    useEffect(() => {
        const nav = document.getElementById('nav')
        if (nav) {
          const vh = (nav.offsetHeight / screen.height) * 100
          setAdjustedHeight((98 - vh) + 'vh')
        }

    }, [])


    if ( status === "loading" ) {
        return (
            <div className="flex justify-center m-4">
                    <ClipLoader color="#fcbe6a" size="10vh" />
                </div>
            )
    } else if (status === "authenticated") {
        return (
            <div className="flex justify-center" style={{height: adjustedHeight}}>
                <AlertBanner />
                <Chat />
            </div>
        )
    } else {
        return <NotLoggedIn />
    }



}

