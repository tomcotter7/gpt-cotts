"use client"
import { signOut, useSession } from 'next-auth/react'

export default function SignOut() {
    const { data: session, staus } = useSession()

    const onSignOut = () => {
        signOut({ callbackUrl: '/' })
    }

    return (
        <>
            <div className="flex flex-col items-center mt-10">
                <p className="text-2xl font-bold"> Are you sure you want to sign out? </p>
                <button className="mt-2 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine font-bold py-2 px-4 rounded-md justify-center w-1/12" onClick={onSignOut}>
                    Sign out
                </button>
                <p className="text-skyblue">* If you were redirected here, it's likely your session expired. Please sign out and then sign back in. </p>
            </div>
        </>
    )
}
