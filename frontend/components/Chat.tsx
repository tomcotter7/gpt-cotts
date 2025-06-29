import { useState, useEffect, useRef, CSSProperties, memo, useCallback } from "react";
import { useSession } from "next-auth/react";

import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

import { SendIcon, RubberDuckIcon, DeleteIcon } from "@/components/Icons";
import { useToast } from '@/providers/Toast';
import { ToastBox } from '@/components/Toast';

import { PreviousConversationsMenu, PrevConversation } from '@/components/PreviousConversations';
import { useSettings } from "@/providers/Settings";

interface ContextItem {
  id: number;
  text: string;
  meta: {
    class: string;
  }
}

interface BackendRequest {
  query: string;
  history: ChatMessage[];
  model: string;
  expertise: string;
  rubber_duck_mode: boolean;
  view_reasoning: boolean;
  reasoning_level: number;
}

async function save(chats: ChatMessage[], id: string | null, title: string | null, access_token: string): Promise<{ conversation_id: string, title: string } | null> {
  let body = JSON.stringify({ chats: chats })
  if (id !== null) {
    body = JSON.stringify({ chats: chats, conversation_id: id, title: title });
  }

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${access_token}`
    },
    body: body
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat_data/save`, requestOptions);
  if (response.ok) {
    const data = await response.json();
    return data
  } else {
    return null;
  }
}

async function* processStream(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return;
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value);
    }
  } finally {
    reader.releaseLock();
  }
}


interface Conversation {
  title: string | null;
  conversation_id: string | null;
}

export interface ChatMessage {
  content: string;
  context: Array<ContextItem>;
  role: string;
  id: number;
}

export function Chat({ initPrevConversations, initChats }: { initPrevConversations: PrevConversation[], initChats: ChatMessage[] }) {


  const { data: session, status, update } = useSession();
  void status;

  const contentRef = useRef<HTMLDivElement>(null);
  const stop = useRef<boolean>(false);

  const [chats, setChats] = useState<ChatMessage[]>(initChats);
  const [generating, setGenerating] = useState<boolean>(false);
  const [prevConversations, setPrevConversations] = useState<PrevConversation[]>(initPrevConversations);
  const [currentConv, setCurrentConv] = useState<Conversation>({ title: null, conversation_id: null });
  const [thinking, setThinking] = useState(false);

  const { settings } = useSettings();

  const { updateToasts } = useToast();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "l" && e.altKey) {
        e.preventDefault();
        setChats([]);
        setCurrentConv({ title: null, conversation_id: null });
      }
      if (e.key === "G" && e.altKey) {
        e.preventDefault();
        scrollToBottom()
      }

      if (e.key === "g" && e.altKey) {
        e.preventDefault()
        scrollToTop()
      }

    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);

  }, []);

  useEffect(() => {
    const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
    const saveButton = document.getElementById("saveButton") as HTMLButtonElement;

    if (chats.length === 0) {
      saveButton.disabled = true;
      clearButton.disabled = true;
    } else if (!generating) {
      saveButton.disabled = false;
      clearButton.disabled = false;
    }
    localStorage.setItem("chats", JSON.stringify(chats));

    if (settings.autoSave && !generating && session?.access_token && chats.length > 0) {
      const debouncedSave = setTimeout(() => {
        save(chats, currentConv.conversation_id, currentConv.title, session.access_token || "")
          .then((data) => {
            if (data !== null && currentConv.conversation_id !== data.conversation_id) {
              setCurrentConv({
                conversation_id: data.conversation_id,
                title: data.title
              });
              setPrevConversations((prev) => {
                return prev.concat({ title: data.title, conversation_id: data.conversation_id });
              })
            }
          });
      }, 2000);
      return () => clearTimeout(debouncedSave);
    }

  }, [chats, currentConv.conversation_id, currentConv.title, generating, settings.autoSave, session?.access_token]);

  useEffect(() => {

    if (generating) {
      scrollToBottom();
    }

    const stopButton = document.getElementById("stopButton") as HTMLButtonElement;
    const saveButton = document.getElementById("saveButton") as HTMLButtonElement;
    const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
    if (generating) {
      stopButton.disabled = false;
      saveButton.disabled = true;
      clearButton.disabled = true;
    } else {
      stopButton.disabled = true;
    }
  }, [generating]);

  function scrollToTop() {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }

  function scrollToBottom() {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  };

  const handleDeleteMessage = useCallback((messageId: number) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== messageId));
  }, []);

  async function sendMessage(request: BackendRequest, url: string): Promise<Response> {
    if (!session) {
      throw new Error("No active session. Something went wrong")
    }


    const makeRequest = async (token: string) => {
      const rawBody = JSON.stringify(request);
      console.log("rawBody:", rawBody)
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: rawBody
      };

      const response = await fetch(url, requestOptions);
      return response
    }

    let response = await makeRequest(session.access_token)
    if (response.status === 401) {
      const newSession = await update();
      if (!newSession?.access_token) {
        throw new Error('Failed to refresh token');
      }
      response = await makeRequest(newSession.access_token)
    }
    if (response.ok) {
      if (response.body) {
        return response
      }
      throw new Error("Something went wrong.")
    } else if (response.status === 401) {
      throw new Error("Unable to send message even after token refresh. You might have to refresh the page")
    } else {
      throw new Error("Something went wrong.")
    }
  }

  async function makeLLMRequest(request: BackendRequest, rag: boolean) {
    if (!session) {
      return;
    }

    let url = `${process.env.NEXT_PUBLIC_API_URL}/generation/base`;
    if (rag) {
      url = `${process.env.NEXT_PUBLIC_API_URL}/generation/rag`;
    }

    try {
      let value = ""
      setChats((prev) => [...prev, { role: "assistant", content: value, id: Date.now(), context: [] }]);
      setThinking(true);
      const response = await sendMessage(request, url);

      const context = response.headers.get('x-relevant-context');
      let parsedContext: Array<ContextItem> = [];
      if (context) {
        parsedContext = JSON.parse(atob(context)) as Array<ContextItem>;
      }

      const modelUsed = response.headers.get('x-model-used');

      if (modelUsed != settings.model) {
        updateToasts(`Error in request, we switched you to: ${modelUsed}`, true)
      }

      const stream = response.body;
      let lastUpdateTime = 0;
      let isFirstChunk = true;
      setGenerating(true);
      for await (const chunk of processStream(stream)) {
        if (isFirstChunk) {
          setTimeout(() => setThinking(false), 0);
          isFirstChunk = false
        }
        if (stop.current) {
          stop.current = false;
          break;
        }
        value += chunk;

        const now = Date.now();
        if (now - lastUpdateTime > 75) {
          setChats((prev) => [...prev.slice(0, prev.length - 1), { role: "assistant", content: value, id: Date.now(), context: parsedContext }]);
          lastUpdateTime = now
        }
      }


      setChats((prev) => [...prev.slice(0, prev.length - 1), { role: "assistant", content: value, id: Date.now(), context: parsedContext }]);
      setGenerating(false);
    } catch (error) {
      const errorString = error instanceof Error ? error.message : String(error);
      updateToasts(errorString, false)
    }
  }

  async function saveChatsToServer() {
    if (!session) {
      return;
    }

    const data = await save(chats, currentConv.conversation_id, currentConv.title, session.access_token);

    if (data !== null) {
      updateToasts("Chat saved successfully!", true);
      let oldConvs = prevConversations;
      if (currentConv.conversation_id === data.conversation_id) {
        oldConvs = oldConvs.filter((conv) => conv.conversation_id !== currentConv.conversation_id);
      }

      oldConvs.push({ title: data.title, conversation_id: data.conversation_id });
      setPrevConversations(oldConvs);
      setCurrentConv({ conversation_id: data.conversation_id, title: data.title });
    } else {
      updateToasts("Error saving chat. Please try again.", false);
    }

  }

  function onChatSubmit() {
    const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement;
    const message = chatInput.value;
    const userChat = { role: "user", content: message, id: Date.now(), context: [] };
    setChats((prev) => [...prev, userChat]);
    console.log(chats)
    makeLLMRequest(
      {
        query: message,
        history: chats,
        model: settings.model,
        expertise: convertSliderToExpertise(settings.expertiseSlider),
        rubber_duck_mode: settings.rubberDuck,
        view_reasoning: settings.viewReasoning,
        reasoning_level: convertReasoningLevelToFraction(settings.reasoningLevel)
      }, settings.rag);

  }

  function clearChat() {
    if (generating) {
      stop.current = true;
    }
    setChats([]);
    setCurrentConv({ title: null, conversation_id: null });
  }

  async function handlePrevConversationSelected(conversation_id: string, title: string) {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "Authorization": `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ conversation_id: conversation_id })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat_data/single_chat`, requestOptions);
    const data = await response.json();
    const conversation = data.chats;
    const newChats: ChatMessage[] = [];
    for (let i = 0; i < conversation.length; i++) {
      newChats.push({ role: conversation[i].role, content: conversation[i].content, id: i, context: conversation[i].context });
    }
    setCurrentConv({ conversation_id: conversation_id, title: title });
    setChats(newChats);
  }

  async function handlePrevConversationDeleted(conversation_id: string) {
    setPrevConversations((prev) => prev.filter((conv) => conv.conversation_id !== conversation_id));
    if (conversation_id === currentConv.conversation_id) {
      setCurrentConv({ title: null, conversation_id: null });
      setChats([]);
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "Authorization": `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ conversation_id: conversation_id })
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat_data/delete`, requestOptions);
    if (!response.ok) {
      updateToasts("Error deleting conversation. Please try again.", false);
      return;
    }
    updateToasts("Conversation deleted successfully!", true);
  }

  const scrollbarHideStyle: CSSProperties = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }

  if (!session) {
    return <> </>;
  }

  let username = session.user?.name;
  if (!username) {
    username = "User";
  }


  return (
    <div className="w-full flex flex-col h-screen">
      <ToastBox />
      <PreviousConversationsMenu prevConversations={prevConversations} onConversationSelect={handlePrevConversationSelected} onConversationDelete={handlePrevConversationDeleted} />
      <div className="flex justify-center mt-2 mb-1">
        <button
          id="stopButton"
          className="disabled relative inline-flex h-8 w-1/12 justify-center items-center px-4 mx-1 text-black before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
          onClick={() => stop.current = true}
        >
          <b> stop </b>
        </button>
        <button
          id="clearButton"
          className="disabled relative inline-flex h-8 w-1/12 justify-center items-center px-4 mx-1 text-black before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
          onClick={clearChat}
        >
          <b> clear </b>
        </button>
        <button
          id="saveButton"
          className="disabled relative inline-flex h-8 w-1/12 justify-center items-center px-4 mx-1 text-black before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
          onClick={saveChatsToServer}
        >
          <b> save </b>
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <div ref={contentRef} style={scrollbarHideStyle} className="w-full sm:h-[calc(100vh-280px)] h-[calc(100vh-240px)] overflow-y-auto">
          {chats.slice(0, -1).map((chat) => {
            return (
              <ChatBox key={chat.id} id={chat.id} role={chat.role} text={chat.content} context={chat.context} name={username} thinking={false} onDelete={handleDeleteMessage} />
            )
          })}

          {chats.length > 0 ? <ChatBox key={chats[chats.length - 1].id} id={chats[chats.length - 1].id} role={chats[chats.length - 1].role} text={chats[chats.length - 1].content} context={chats[chats.length - 1].context} name={username} thinking={thinking} onDelete={handleDeleteMessage} /> : null}
        </div>
      </div>
      <ChatForm onChatSubmit={onChatSubmit} />
    </div>
  )
}

interface ChatFormProps {
  onChatSubmit: () => void;
}

const sliderToExpertiseMap: Record<number, string> = {
  0: "baby-like",
  25: "basic",
  50: "normal",
  75: "expert",
  100: "masterful"
};

const convertSliderToExpertise = (slider: number): string => {
  return sliderToExpertiseMap[slider] || "masterful";
};

const convertReasoningLevelToFraction = (reasoningLevel: number): number => {
  return (reasoningLevel / 100)
}

const ChatForm = memo(function ChatForm({ onChatSubmit }: ChatFormProps) {

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && e.altKey) {
        e.preventDefault();
        textAreaRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function resetChatInput() {
    const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement;
    chatInput.value = "";
    chatInput.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key == "Enter" && e.shiftKey === false) {
      e.preventDefault();
      onChatSubmit();
      resetChatInput();
    } else {
      if (!resizeTimeout.current) {
        resizeTimeout.current = setTimeout(() => {
          const textarea = e.currentTarget
          textarea.style.height = "auto";
          const newHeight = Math.min(textarea.scrollHeight, 200);
          textarea.style.height = newHeight + "px";

          textarea.style.overflow = textarea.scrollHeight > 200 ? "auto" : "hidden";

          resizeTimeout.current = null;
        }, 50);
      }
    }
  }


  function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    onChatSubmit();
    resetChatInput();
  }

  return (
    <form className="fixed bottom-0 left-0 right-0 w-full bg-grey">
      <div className="flex justify-center px-5 py-3 w-screen space-x-2">
        <div className="flex flex-col w-11/12">
          <div className="bg-skyblue rounded-t">
            <span className="text-black p-1 hidden sm:block text-center">
              Currently using <b>{settings.rag ? "rag" : "no rag"}</b> with <b>{settings.model}</b> with <b> {convertSliderToExpertise(settings.expertiseSlider)} </b> expertise{settings.rag ? ` and reranking with` : ""}{settings.rag ? <b> {settings.rerankModel}</b> : ""}.
            </span>
          </div>
          <textarea
            placeholder="Type your message here..."
            className=" rounded-b resize-none p-2 text-black"
            id="chat-input"
            ref={textAreaRef}
            rows={3}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        <button
          className="relative inline-flex w-1/12 justify-center items-center px-4 mx-1 text-black before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-tangerine-light before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
          onClick={onButtonClick}
        >
          {settings.rubberDuck ? <RubberDuckIcon height={48} width={48} /> : <SendIcon />}
        </button>
      </div>
    </form>
  )
})

interface ChatBoxProps {
  id: number
  role: string;
  text: string;
  context: Array<ContextItem>;
  name: string;
  thinking: boolean;
  onDelete: (id: number) => void;
}

const ChatBox = memo(function ChatBox({ id, role, text, context, name, thinking = false, onDelete }: ChatBoxProps) {

  let containerClasses = `mb-2 w-11/12 p-2 shadow-md m-3`
  if (role === 'user') {
    containerClasses += ` bg-tangerine rounded-e-xl rounded-es-xl`
  } else {
    containerClasses += ` ml-auto bg-skyblue rounded-b-xl rounded-l-xl`
  }

  if (thinking) {
    return (
      <div className={containerClasses}>
        {role === 'user' ? <p className="text-black text-xs"><b>{name}</b> (You)</p> : <p className="text-black text-xs"><b>gpt-cotts</b></p>}
        <p className="animate-pulse text-black">thinking...</p>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <div className="flex group">
        {role === 'user' ? <p className="text-black text-xs"><b>{name}</b> (You)</p> : <p className="text-black text-xs"><b>gpt-cotts</b></p>}
        <div className="flex ml-auto">
          <button
            className="bg-red-400 mx-1 p-1 rounded"
            onClick={() => onDelete(id)}
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
      <div className="min-h-5">
        <Markdown
          className="text-black markdown-content"
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code(props) {
              const { children, className, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                // @ts-expect-error This follows the documentation - https://github.com/remarkjs/react-markdown.
                <SyntaxHighlighter
                  {...rest}
                  PreTag="div"
                  language={match[1]}
                  style={dark}
                  showLineNumbers={true}
                >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
              ) : (
                <code {...rest} className={className}>
                  {children}
                </code>
              )
            }
          }}
        >{text}</Markdown>
      </div>
      {context.length > 0 ? <ContextBox context={context} /> : null}
    </div >
  )

})


interface ContextBoxProps {
  context: Array<ContextItem>;
}

function ContextBox({ context }: ContextBoxProps) {


  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <div className="bg-skyblue-dark p-1">
        <button className="m-1 text-black p-1 rounded shadow-lg hover:bg-skyblue" onClick={() => setOpen(true)}>View context</button>
      </div>
    )
  } else {

    return (
      <div className="p-1 border-t-4 border-skyblue-dark">
        <button className="m-1 bg-skyblue text-black p-1 rounded bg-skyblue-dark hover:bg-skyblue-light hover:border-skyblue-dark" onClick={() => setOpen(false)}>Hide context</button>
        {context.map((context_item) =>
          <>
            <p key={context_item.id} className="mx-2 text-black shadow-lg my-2 p-2"> {context_item.text} | This context came from the topic <b>{context_item.meta.class}</b></p>
          </>
        )}
      </div>
    )
  }
}
