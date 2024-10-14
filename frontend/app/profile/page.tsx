import { getServerSession }  from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'


export default async function Profile() {

    const session = await getServerSession(authOptions)
    if (!session) {
        return redirect("/api/auth/signin/google")
    }

    let username = session.user?.name
    if (!username) {
        username = "User"
    }

    let email = session.user?.email
    if (!email) {
        email = "Email"
    }

    return (
        <div className="flex flex-col items-center m-4">
            <div className="w-1/2 rounded-lg shadow-md flex flex-col items-center m-4 p-4">
                <p className="text-tangerine text-4xl">{username}</p>
                <p>{email}</p>
            </div>
            <form action="/api/auth/signout" method="POST">
                <button 
                    className="mt-2 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine text-black py-2 px-4 rounded-md justify-center w-full" 
                    type="submit"
                >
                    <b>Sign Out</b>
                </button>
            </form>
        </div>
    )
}
