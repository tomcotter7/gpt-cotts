import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { NotesContent } from './clientNotes'

export default async function Notes() {

    const session = await getServerSession(authOptions)
    if (!session) {
        return redirect("/api/auth/signout/google")
    }

    const request_options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': 'Bearer ' + session.access_token
        }
    }

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notes/get`, request_options
    )

    if (response.status !== 200) {
        return redirect("/api/auth/signout/google")
    }


    const data = await response.json()
    const sections = data.sections
    const filenames = data.filenames

    return (
        <div className="mx-auto px-4 py-8">
            <h1 className="text-tangerine text-5xl font-bold mb-8 text-center">Notes</h1>
            <NotesContent initialNotes={sections} initialFilenames={filenames} initialCurrentFilename={filenames[0]} />
        </div>
    )
}
