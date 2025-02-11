import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import { NotesContent, Note } from './clientNotes'
import { ToastProvider } from '@/providers/Toast'

export default function Notes() {
  return (
    <ToastProvider>
      <div>
        <h1 className="text-tangerine text-5xl font-bold mb-8 mt-2 text-center">Notes</h1>
        <AuthenticatedNotesContent />
      </div>
    </ToastProvider>
  )
}



async function AuthenticatedNotesContent() {

  const session = await getServerSession(authOptions)
  if (!session) {
    return redirect('/api/auth/signout/google')
  }


  const makeRequest = async (token: string) => {
    const request_options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/get`, request_options)
    return response
  }

  let response = await makeRequest(session.access_token)


  if (response.status !== 200) {
    return <p> Unable to load notes, try again later </p>
  }


  const data = await response.json()
  const note: Note = data.note
  const filenames = data.filenames

  return (
    <NotesContent
      filenames={filenames}
      currentFilename={filenames[0]}
      note={note}
    />
  )

}
