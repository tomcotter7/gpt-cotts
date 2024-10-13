"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { NotLoggedIn } from '@/components/NotLoggedIn';
import { Chat } from '@/components/Chat';
import { ClipLoader } from 'react-spinners';

export default function Home() {
    
    const { data: _, status } = useSession();
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
                <Chat />
            </div>
        )
    } else {   
        return <NotLoggedIn />
    }



}
