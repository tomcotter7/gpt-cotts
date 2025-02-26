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

  const response = await makeRequest(session.access_token)

  if (response.status !== 200) {
    return (
      <div className="flex flex-col items-center justify-center p-6 my-8 mx-auto max-w-md rounded-lg bg-red-50 border border-red-200 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-lg font-medium text-red-700 mb-2">Unable to load notes</p>
        <p className="text-sm text-red-500 text-center">Please try again later or contact support if the problem persists.</p>
      </div>
    );
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
