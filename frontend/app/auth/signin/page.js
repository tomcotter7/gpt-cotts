"use client"
import { signIn, useSession } from 'next-auth/react'


export default function SignIn() {
    const { data: session, status } = useSession()

    const not_expired = session && new Date(session.expires).getTime() > Date.now()
    if (status === "authenticated" && not_expired) {
        window.location.href = "/"
    }

    return (
        <>
            <div className="flex justify-center mt-10">
                <button className="mt-2 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine font-bold py-2 px-4 rounded-md justify-center flex" onClick={() => signIn("google", { callbackUrl: "/" })}>
                    <img className="w-6 h-6 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" /> Sign in w/ Google
                </button>
            </div>
        </>
    )
}
