"use client"

import { useSession } from 'next-auth/react'
import { ClipLoader } from 'react-spinners'


export default function Profile() {
    const {data: session, status} = useSession()


    if (status === "loading") {
        return (
            <div className="flex justify-center items-center m-4">
                <ClipLoader color="#96f4a2" size="10vh" />
            </div>
        )
    }

    if (status === "unauthenticated") {
        window.location.href = "/api/auth/signin/google"
        return
    }

    return (
        <div className="flex flex-col  items-center m-4">
            <div className="w-1/2 rounded-lg shadow-md flex flex-col items-center m-4 p-4">
                <p className="text-tangerine text-4xl">{session.user.name}</p>
                <p>{session.user.email}</p>
            </div>
            <button className="mt-2 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine text-black py-2 px-4 rounded-md justify-center w-1/12" onClick={() => window.location.href = "/api/auth/signout/google"}><b>Sign Out</b></button>
        </div>
        
    )

}

