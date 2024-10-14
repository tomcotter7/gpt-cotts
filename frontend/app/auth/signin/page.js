"use client"

import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'

export default function SignIn() {
    const { data: session, status } = useSession()
    
    const not_expired = session && new Date(session.expires).getTime() > Date.now()
    if (status === "authenticated" && not_expired) {
        window.location.href = "/"
    }

    async function handleSignIn(e) {
        e.preventDefault()
        await signIn("google", { callbackUrl: "/" })
    }

    return (
        <>
            <div className="flex justify-center mt-10">
                <button className="mt-2 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine font-bold py-2 px-4 rounded-md justify-center flex" onClick={handleSignIn}>
                    <Image className="mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" width={24} height={24} alt="google logo" /> Sign in w/ Google
                </button>
            </div>
        </>
    )
}
