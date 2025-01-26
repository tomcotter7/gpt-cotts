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
        <button
          className="relative inline-flex h-8 m-2 justify-center items-center px-4 mx-1 text-black before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
          onClick={onSignOut}
        >
          Sign out
        </button>
        <div className="bg-skyblue shadow-md rounded-md p-4 mt-4 hover:shadow-lg border border-gray-200">
          <p className="text-black text-sm">* If you were redirected here, it&apos;s likely your session expired. Please sign out and then sign back in. </p>
        </div>
      </div>
    </>
  )
}
