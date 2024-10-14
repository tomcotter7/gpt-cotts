import { signOut, useSession } from 'next-auth/react'


export function NotLoggedIn() {

    const { data: session, status } = useSession()

    if (status === "authenticated" && session.expires < Date.now()) {
        signOut({ callbackUrl: '/' })
    }


    return (
        <div className="flex flex-col text-center items-center py-20">
            <p className="text-6xl font-bold text-black mb-4">
                <u>not logged in :(</u>
            </p>
            <p className="text-2xl text-black mb-8">
                log into to continue to gpt-cotts
            </p>
            <p className="text-xl font-bold text-tangerine">
                <u>pm us (@tcotts / @luizayaara) on twitter for access</u>
            </p>
        </div>
    )
  
}

