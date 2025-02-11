"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { ClipLoader } from 'react-spinners';

// import { AlertBanner } from '@/components/AlertBanner';
import { NotLoggedIn } from '@/components/NotLoggedIn';
import { Chat, ChatMessage } from '@/components/Chat';
import { ToastProvider } from '@/providers/Toast';

export default function Home() {

  const { data: session, update, status } = useSession();
  const [adjustedHeight, setAdjustedHeight] = useState('93vh')
  const [valid, setValid] = useState(true)

  useEffect(() => {
    const nav = document.getElementById('nav')
    if (nav) {
      const vh = (nav.offsetHeight / screen.height) * 100
      setAdjustedHeight((98 - vh) + 'vh')
    }

  }, [])

  useEffect(() => {
    async function getValidity() {
      if (!session) return;

      const makeRequest = async (token: string) => {

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user_data/validate`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        });
        return response;
      };

      try {

        let response = await makeRequest(session.access_token);

        if (response.status !== 200) {
          const newSession = await update()
          if (!newSession?.access_token) {
            throw new Error('Failed to refresh token');
          }
          response = await makeRequest(newSession.access_token)
        }

        if (response.status !== 200) {
          throw new Error('Failed after token refresh');
        }

        const data = await response.json()
        if (!data.valid) { setValid(data.valid) }
      } catch {
        window.location.href = "/api/auth/signout/google"
      }
    }
    getValidity()

  }, [session, update])


  if (status === "loading") {
    return (
      <div className="flex justify-center m-4">
        <ClipLoader color="#fcbe6a" size="10vh" />
      </div>
    )
  } else if (!session || status !== "authenticated") {
    return <NotLoggedIn />
  } else {
    const rawChats = localStorage.getItem('chats')
    let initChats: ChatMessage[] = []
    if (rawChats !== null) {
      initChats = JSON.parse(rawChats)
    }
    return (
      <ToastProvider>
        <div className="flex justify-center" style={{ height: adjustedHeight }}>
          { /** <AlertBanner /> **/}
          <Chat valid={valid} initChats={initChats} />
        </div>
      </ToastProvider>
    )

  }
}

