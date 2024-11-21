"use client"
import { signOut } from 'next-auth/react'

export default function SignOut() {

    const onSignOut = () => {
        localStorage.removeItem('chats')
        signOut({ callbackUrl: '/' })
    }

    return (
        <>
            <div className="flex flex-col items-center mt-10">
                <p className="text-2xl font-bold text-black"> Are you sure you want to sign out? </p>
                <button className="mt-2 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine font-bold py-2 px-4 rounded-md justify-center w-1/12" onClick={onSignOut}>
                    Sign out
                </button>
                <div className="bg-skyblue shadow-md rounded-md p-1 mt-4">
                    <p className="text-black text-sm">* If you were redirected here, it&apos;s likely your session expired. Please sign out and then sign back in. </p>
                </div>
            </div>
        </>
    )
}
