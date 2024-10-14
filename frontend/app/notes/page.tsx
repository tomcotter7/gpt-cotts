import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import { NotesContent, Note } from './clientNotes'
import { ToastProvider } from '@/providers/Toast'

export default async function Notes() {
    
    const session = await getServerSession(authOptions)
    if (!session) {
        return redirect('/api/auth/signout/google')
    }

    const request_options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/get`, request_options)

    if (response.status !== 200) {
        return redirect('/api/auth/signout/google')
    }

    const data = await response.json()
    const note: Note = data.note
    const filenames = data.filenames

    return (
        <ToastProvider>
            <div>
                <h1 className="text-tangerine text-5xl font-bold mb-8 mt-2 text-center">Notes</h1>
                <NotesContent filenames={filenames} currentFilename={filenames[0]} note={note} />
            </div>
        </ToastProvider>
    )

}
