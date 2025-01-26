import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'


import ClientProfile from './clientProfile'

interface Usage {
  admin: boolean
  available_credits: number
  total_input_tokens: number
  total_output_tokens: number
}

export default async function Profile() {

  const session = await getServerSession(authOptions)
  if (!session) {
    return redirect("/api/auth/signout/google")
  }

  const username = session.user?.name
  const email = session.user?.email

  if (!username || !email) {
    return redirect("/api/auth/signout/google")
  }

  console.log(username, email)

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user_data/usage`, requestOptions)
  const usage: Usage = await response.json()

  return (
    <div className="flex flex-col items-center m-4">
      <div className="w-1/2 flex flex-col items-center p-4">
        <p className="text-tangerine text-4xl">{username}</p>
        <p className="text-black">{email}</p>
        <ClientProfile admin={usage.admin} available_credits={usage.available_credits} total_input_tokens={usage.total_input_tokens} total_output_tokens={usage.total_output_tokens} />
      </div>
      <form action="/api/auth/signout" method="POST">
        <button
          className="relative inline-flex h-8 justify-center items-center px-4 mx-1 text-black before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
          type="submit"
        >
          <b>Sign Out</b>
        </button>
      </form>
    </div>
  )
}
