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
        <button
          className="relative inline-flex p-2 justify-center items-center px-4 mx-1 text-black before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
          onClick={handleSignIn}
        >
          <Image className="mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" width={24} height={24} alt="google logo" /> Sign in w/ Google
        </button>
      </div>
    </>
  )
}
