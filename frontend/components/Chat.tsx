"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { useSession } from "next-auth/react";

import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

import { SendIcon, RubberDuckIcon } from "./Icons";
import { SettingsInterface } from "./Settings";
import { SettingsDisplay } from '@/components/Settings';

interface BackendRequest {
    query: string;
    history: ChatMessage[];
    model: string;
    expertise: string;
    rubberDuck: boolean;
}

async function sendMessage( request: BackendRequest, url: string, token: string): Promise<Response | string> {

    
    const rawBody = JSON.stringify(request);
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
    if (response.ok) {

        if (response.body) {
            return response
        }
        return "Error";
    } else {
        if (response.status === 401) {
            return "Unauthorized";
        } else {
            return "Error";
        }
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


interface ChatMessage {
    content: string;
    context: Array<ContextItem>;
    role: string;
    id: number;
}

export function Chat() {
    
    const { data: session, status } = useSession();
    void status;

    const contentRef = useRef<HTMLDivElement>(null);
    const stop = useRef<boolean>(false);

    const [chats, setChats] = useState<ChatMessage[]>([]);
    const [generating, setGenerating] = useState<boolean>(false);
    const [settings, setSettings] = useState<SettingsInterface>({
        rag: false,
        rubberDuck: false,
        expertiseSlider: 50,
        model: "claude-3-5-sonnet-20241022",
        rerankModel: "cohere"
    });

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "l" && e.altKey) {
                e.preventDefault();
                setChats([]);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {

        const clearButton = document.getElementById("clearButton");
        if (chats.length === 0 && clearButton) {
            clearButton.classList.add("hidden");
        } else if (clearButton) {
            clearButton.classList.remove("hidden");
        }
    }, [chats]);

    useEffect(() => {

        if (generating) {
            scrollToBottom();
        }

        const stopButton = document.getElementById("stopButton");
        if (generating && stopButton) {
            stopButton.classList.remove("hidden");
        } else if (stopButton) {
            stopButton.classList.add("hidden");
        }
    }, [generating]);

    function scrollToBottom() {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    };

    async function makeLLMRequest(request: BackendRequest, rag: boolean) {

        if (!session) {
            return;
        }

        let url = `${process.env.NEXT_PUBLIC_API_URL}/generation/base`;
        if (rag) {
            url = `${process.env.NEXT_PUBLIC_API_URL}/generation/rag`;
        }
        const response = await sendMessage(request, url, session.access_token);
        
        if (typeof response === "string") {
            if (response === "Unauthorized") {
                setChats([])
                window.location.href = "/api/auth/signout/google"
            } else if (response === "Error") {
                setChats([])
                alert("Error generating response. Please try again.")
            }
        } else {
            let value = ""

            const context = response.headers.get('x-relevant-context');

            let parsedContext: Array<ContextItem> = [];
            if (context) {
                parsedContext = JSON.parse(atob(context)) as Array<ContextItem>;
            }

            const stream = response.body;
            setChats((prev) => [...prev, {role: "assistant", content: value, id: Date.now(), context: parsedContext}]);
            setGenerating(true);
            for await (const chunk of processStream(stream)) {
                if (stop.current) {
                    stop.current = false;
                    break;
                }
                value += chunk;
                setChats((prev) => [...prev.slice(0, prev.length-1), {role: "assistant", content: value, id: Date.now(), context: parsedContext} ]);
            }

            setGenerating(false);

        }
    }

    function onChatSubmit() {
        const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement;
        const message = chatInput.value;
        const userChat = {role: "user", content: message, id: Date.now(), context: []};
        setChats((prev) => [...prev, userChat]);
        makeLLMRequest(
            {
                query: message,
                history: chats,
                model: settings.model,
                expertise: convertSliderToExpertise(settings.expertiseSlider),
                rubberDuck: settings.rubberDuck
            }, settings.rag);
    }

    function clearChat() {
        if (generating) {
            stop.current = true;
        }
        setChats([]);
    }

    const scrollbarHideStyle: CSSProperties = {
        overflowY: 'auto',
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
        <div className="max-h-full flex flex-col">
            <SettingsDisplay passedSettings={settings} onSettingsChange={(settings) => setSettings(settings)} />
            <div className="flex justify-center mt-2 mb-1">
                <button
                    id="stopButton"
                    className="px-4 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine hover:border text-black rounded mr-2 w-1/12 hidden"
                    onClick={() => stop.current = true}
                >
                    <b> stop </b>
                </button>
                <button
                    id="clearButton"
                    className="px-4 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine hover:border text-black rounded w-1/12 hidden"
                    onClick={clearChat}
                >
                    <b> clear </b>
                </button>
            </div>
            <div className="h-1/4 flex flex-grow w-full">
                <div ref={contentRef} style={scrollbarHideStyle} className="h-full w-full">
                {chats.map((chat) => {
                    return (
                        <ChatBox key={chat.id} role={chat.role} text={chat.content} context={chat.context} name={username} />
                    )
                })}
                </div>
            </div>
            <ChatForm settings={settings} onChatSubmit={onChatSubmit} />
        </div>
    )
}

interface ChatFormProps {
    onChatSubmit: () => void;
    settings: SettingsInterface;
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

function ChatForm({ onChatSubmit, settings }: ChatFormProps) {

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
            e.currentTarget.style.height = "auto";
            const newHeight = Math.min(e.currentTarget.scrollHeight, 200);
            e.currentTarget.style.height = newHeight + "px";

            if (e.currentTarget.scrollHeight > 200) {
                e.currentTarget.style.overflow = "auto";
            } else {
                e.currentTarget.style.overflow = "hidden";
            }
        }
    }


    function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        onChatSubmit();
        resetChatInput();
    }

    return  (
            <form className="sticky top-[100vh]">
            <div className="flex justify-center px-5 py-3 w-screen space-x-2">
                <div className="flex flex-col w-11/12 border">
                <div className="bg-skyblue rounded-t">
                    <span className="text-black p-2">
     Currently using <b>{settings.rag ? "rag" : "no rag"}</b> with <b>{ settings.model }</b> with <b> { convertSliderToExpertise(settings.expertiseSlider) } </b> expertise{settings.rag ? ` and reranking with` : ""}{settings.rag ? <b> {settings.rerankModel}</b> : ""}.
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
                <button className="bg-tangerine rounded border-2 border-tangerine p-2 hover:bg-tangerine-dark" onClick={onButtonClick}>
                    { settings.rubberDuck ? <RubberDuckIcon height={48} width={48} /> : <SendIcon /> }
                </button>
            </div>
        </form>
    )
}

interface ChatBoxProps {
    role: string;
    text: string;
    context: Array<ContextItem>;
    name: string;
}

function ChatBox({ role, text, context, name }: ChatBoxProps) {
    
    let containerClasses = `mb-2 w-11/12 p-2 shadow-md m-3`
    if (role === 'user') {
        containerClasses += ` bg-tangerine rounded-e-xl rounded-es-xl`
    } else {
        containerClasses += ` ml-auto bg-skyblue rounded-b-xl rounded-l-xl`
    }

    return (
        <div className={containerClasses}>
            {role === 'user'? <p className="text-black text-xs"><b>{name}</b> (You)</p>: <p className="text-black text-xs"><b>gpt-cotts</b></p>}
            <div className="max-w-full min-h-5">
                <Markdown
                    className="text-black markdown-content"
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                    code(props) {
                    const {children, className, ...rest} = props;
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                            // @ts-expect-error This follows the documentation - https://github.com/remarkjs/react-markdown.
                            <SyntaxHighlighter
                                {...rest}
                                PreTag="div"
                                language={match[1]}
                                style={dark}
                            >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                        ) : (
                            <code {...rest} className={className} style={{"whiteSpace": "pre-wrap", "wordWrap": "break-word", "display": "inline-block", "maxWidth": "100%"}}>
                                {children}
                            </code>
                        )
                        }
                    }}
                >{text}</Markdown>
            </div>
            { context.length > 0 ? <ContextBox context={context} /> : null }
        </div>
    )

}

interface ContextItem {
    id: number;
    text: string;
    meta: {
        class: string;
    }
}

interface ContextBoxProps {
    context: Array<ContextItem>;
}

function ContextBox({context}: ContextBoxProps) {

    
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
