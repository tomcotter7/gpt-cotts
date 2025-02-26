"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { ClipLoader } from 'react-spinners';

import { NotLoggedIn } from '@/components/NotLoggedIn';
import { Chat, ChatMessage } from '@/components/Chat';
import { PrevConversation } from '@/components/PreviousConversations';
import { SettingsInterface } from '@/components/Settings';
import { ToastProvider } from '@/providers/Toast';

const makeRequest = async (token: string, url: string) => {

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json'
    }
  });
  return response;
};

export default function Home() {

  const { data: session, update, status } = useSession();
  const [adjustedHeight, setAdjustedHeight] = useState('93vh')

  const [isLoading, setIsLoading] = useState(true);
  const [prevConversations, setPrevConversations] = useState<PrevConversation[]>([]);
  const [settings, setSettings] = useState<SettingsInterface>(
    {
      rag: false,
      rubberDuck: false,
      expertiseSlider: 50,
      model: "claude-3-5-sonnet-20241022",
      rerankModel: "cohere",
      autoSave: false,
      viewReasoning: true,
      reasoningLevel: 0,
    });

  useEffect(() => {
    const nav = document.getElementById('nav')
    if (nav) {
      const vh = (nav.offsetHeight / screen.height) * 100
      setAdjustedHeight((98 - vh) + 'vh')
    }

  }, [])

  async function initializeUserData() {
    if (!session) return;

    try {
      const conversationsUrl = `${process.env.NEXT_PUBLIC_API_URL}/chat_data/all`;
      const settingsUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_data/settings`;

      let [conversationsRes, settingsRes] = await Promise.all([
        makeRequest(session.access_token, conversationsUrl),
        makeRequest(session.access_token, settingsUrl)
      ]);

      if (conversationsRes.status === 401 || settingsRes.status === 401) {
        const newSession = await update();
        if (!newSession?.access_token) {
          throw new Error('Failed to refresh token');
        }
        [conversationsRes, settingsRes] = await Promise.all([
          makeRequest(newSession.access_token, conversationsUrl),
          makeRequest(newSession.access_token, settingsUrl)
        ]);
      }

      if (conversationsRes.status !== 200 || settingsRes.status !== 200) {
        throw new Error('Failed after token refresh');
      }

      const conversationsData = await conversationsRes.json();
      const pcs = conversationsData.conversations.map((c: PrevConversation) => ({
        title: c.title,
        conversation_id: c.conversation_id
      }));
      setPrevConversations(pcs);

      const settingsData = await settingsRes.json();
      setSettings(prev => ({
        ...prev,
        ...settingsData,
        rag: (settingsData.rag?.toLowerCase() || "") === "true",
        rubberDuck: (settingsData.rubberDuck?.toLowerCase() || "") === "true",
        autoSave: (settingsData.autoSave?.toLowerCase() || "") === "true",
        expertiseSlider: parseInt(settingsData.expertiseSlider || "50"),
        reasoningLevel: parseInt((settingsData.reasoningLevel || "50")),
        viewReasoning: (settingsData.viewReasoning?.toLowerCase() || "") == "true"
      }));

    } catch {
      window.location.href = "/api/auth/signout/google";
    }
  }

  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      await initializeUserData()
      setIsLoading(false);
    }

    initialize()
  }, [session?.id_token])

  if (status === "loading" || isLoading) {
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
          <Chat initPrevConversations={prevConversations} initSettings={settings} initChats={initChats} />
        </div>
      </ToastProvider>
    )

  }
}

