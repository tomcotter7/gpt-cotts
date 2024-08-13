import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'


export default function NotLoggedIn() {

    const { data: session, status } = useSession()

    if (status === "authenticated" && session.expires < Date.now()) {
        signOut()
    }


    return (
        <div className="flex flex-col text-center items-center py-20">
            <p className="text-6xl font-bold text-white mb-4">
                not logged in :(
            </p>
            <p className="text-2xl text-gray-200 mb-8">
                log into to continue to gpt-cotts
            </p>
            <p className="text-xl font-bold text-spearmint">
                <u>pm us (@tcotts / @luizayaara) on twitter for access</u>
            </p>
        </div>
    )
  
}
