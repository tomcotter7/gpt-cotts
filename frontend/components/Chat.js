import { useState, useRef, useEffect } from "react"
import { useSession } from 'next-auth/react'
import Markdown from 'react-markdown'
import { Settings } from '@/components/Settings'
import { ToastBox } from '@/components/Toast'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import Image from 'next/image'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'

const BoldText = ({ text }) => <b>{text}</b>;

const sendMessage = async (raw_request, url, token) => {
    const raw = JSON.stringify(raw_request);
    const requestOptions = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: raw,
        redirect: 'follow'
      };

    const response = await fetch(url, requestOptions)
  
    if (response.ok) {
      const stream = response.body.pipeThrough(new TextDecoderStream()).getReader();
      return stream
    } else {
      if (response.status === 401) {
        return "Unauthorized"
      }
    }
}

const convertSliderToExpertise = (slider) => {
    if (slider === 0) {
        return "baby-like"
    } else if (slider === 25) {
        return "basic"
    } else if (slider === 50) {
        return "normal"
    } else if (slider === 75) {
        return "expert"
    } else {
        return "masterful"
    }

}
export default function Chat() {

    const [chats, setChats] = useState([])
    const [context, setContext] = useState({})
    const [generating, setGenerating] = useState(false)
    const stop = useRef(false)
    const [settings, setSettings] = useState({
        rag: false,
        model: "claude-3-5-sonnet-20240620",
        slider: 50,
        rerank_model: "cohere"
    })


    const [toasts, setToasts] = useState({})
    const { data: session, status } = useSession()


  function setDisabled(button) {
    button.classList.add('hidden')
  }

  function setEnabled(button) {
    button.classList.remove('hidden')
  }

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'l' && e.altKey) {
                e.preventDefault()
                setChats([])
            }
        }
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

  useEffect(() => {
    const clearButton = document.getElementById('clearButton');
    if (chats.length === 0 && clearButton) {
      setDisabled(clearButton)
    }
    else if (chats.length > 0 && clearButton) {
      setEnabled(clearButton)
    }
  }, [chats])

  useEffect(() => {
    const generateButton = document.getElementById('stopGenerateButton');
    if (!generating && generateButton) {
      setDisabled(generateButton)
    } else if (generating && generateButton) {
      setEnabled(generateButton)
    }
  }, [generating])



  async function makeLLMRequest(request, rag) {
    setGenerating(true)
    stop.current = false
    let stream;

    if (rag) {
      stream = await sendMessage(request, `${process.env.NEXT_PUBLIC_API_URL}/generation/rag`, session.access_token)
    } else {
      stream = await sendMessage(request, `${process.env.NEXT_PUBLIC_API_URL}/generation/base`, session.access_token)
    }

    if (stream === "Unauthorized") {
        setGenerating(false)
        setToasts({...toasts, [Date.now()]: {message: "Your session has expired. Please log in again.", success: false}})
        setChats([])
        window.location.href = "/api/auth/signout/google"
    }
    
    let response = ""
    let { value, done } = await stream.read();
    if (done | stop.current) {
      return response;
    }

    response += value;
      setChats((prevChats) => [{role: 'assistant', content: response, id: Date.now()}, ...prevChats])
    while (true) {
      let { value, done } = await stream.read();
      if (done | stop.current) {
        stop.current = false
        setGenerating(false)
        break;
      }
        try {
            var returned_context = JSON.parse(value)
            var context_list = returned_context['context']
            // set the last chat to have a key of 'context' and the context_list as the value
            setChats((prevChats) => [{role: 'assistant', content: prevChats[0].content, id: Date.now(), context: context_list}, ...prevChats.slice(1, prevChats.length)])
        } catch {
            response += value;
            setChats((prevChats) => [{role: 'assistant', content: response, id: Date.now()}, ...prevChats.slice(1, prevChats.length)])
        }
    }
  }

  function onChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const chatBox = {role: 'user', content: chatInput.value, id: Date.now()};
    setChats((prevChats) => [chatBox, ...prevChats]);
    makeLLMRequest(
        {
            query: chatInput.value,
            history: chats,
            model: settings.model,
            expertise: convertSliderToExpertise(settings.slider)
        }, settings.rag);
  }

  function onStopButtonClick() {
    stop.current = true
  }

  function onClearButtonClick() {
    stop.current = true
    setChats([])
  }

  function handleSettingsChange(newSettings) {
      setSettings(newSettings)
  }

  if (chats.length === 0) {
    return (
      <>
        <ToastBox toasts={toasts} setToasts={setToasts}/>
        <div className="lg:w-screen w-11/12 h-full flex flex-col">
            <Settings passed_settings={settings} onSettingsChange={handleSettingsChange}/>
          <div className="m-4 grow">
            <div className="flex justify-center">
              <Image
                  src="/imgs/sd_logo.png"
                  alt="logo"
                  width={500}
                  height={25}
                  quality={100}
                />
            </div>
          </div>
          <div className="m-4">
            <ChatForm onChatSubmit={onChatSubmit} settings={settings} />
          </div>
        </div>
      </>
    )
  } else {
    return (
      <div className="lg:w-screen w-11/12 h-full flex flex-col">
        <Settings passed_settings={settings} onSettingsChange={handleSettingsChange}/>
        <div className="m-4 grow h-4/6">
          <div className="flex flex-col-reverse mx-2 overflow-y-auto max-h-full" id="chat-boxes">
            {chats.map((chat) => (
              <ChatBox key={chat.id} role={chat.role} text={chat.content} context={chat.context} name={session.user.name}/>
            ))}
          </div>
        </div>
        <div >
          <div className="flex items-center justify-center m-4">
            { generating ? <ClipLoader color="#96f4a2" size="25px" className="hidden" /> : null }
            <button
              id="stopGenerateButton"
              className="mx-3 px-4 bg-tangerine hover:bg-tangerine-dark hover:border hover:border-tangerine rounded text-black hidden"
              onClick={onStopButtonClick}
            >
              <b>stop</b>
            </button>
            <button
              id="clearButton"
              className="px-4 bg-tangerine hover:bg-tangerine-dark hover:border-tangerine hover:border text-black ml-2 hidden rounded"
              onClick={onClearButtonClick}
            >
              <b>clear</b>
            </button>
          </div>
          <ChatForm onChatSubmit={onChatSubmit} settings={settings} />
        </div>
      </div>
    )  
  }
}


function ChatForm({onChatSubmit, settings}) {

    const textAreaRef = useRef(null)

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'k' && e.altKey) {
                e.preventDefault()
                textAreaRef.current.focus()
            }
        }
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

  function resetChatInput() {
    const chatInput = document.getElementById('chat-input');
    chatInput.value = ""
    chatInput.style.height = "10vh"
  }

  function onGoButtonClick(e) {
    onChatSubmit(e)
    resetChatInput()
  }

  function adjustHeight(el){
      el.style.height = "auto"
      el.style.height = `${Math.min((el.scrollHeight / window.innerHeight) * 100, 20)}vh`;
  }

  function onEnterPress(e) {
    if(e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      onChatSubmit(e)
      resetChatInput()
    }
  }
 
  return (
    <div>
      <form>
          <div className="flex flex-row space-x-4 justify-center">
              <div className="flex flex-col justify-center w-11/12">
                  <div className="bg-skyblue rounded-t">
      <span className="text-black p-2">
      Currently using <b>{settings.rag ? "rag" : "no rag"}</b> with <b>{ settings.model }</b> with <b> { convertSliderToExpertise(settings.slider) } </b> expertise{settings.rag ? ` and reranking with` : ""}{settings.rag ? <b> {settings.rerank_model}</b> : ""}.
      </span>

                  </div>
                  <textarea
                    className="p-4 rounded-b text-black"
                    type="text"
                    id="chat-input"
                    ref={textAreaRef}
                    placeholder="What's the issue?"
                    onKeyUp={(e) => adjustHeight(e.target)}
                    onKeyDown={(e) => onEnterPress(e)}
                  />
              </div>
              <button
                className="w-1/24 bg-tangerine hover:bg-tangerine-dark rounded border border-2 border-tangerine text-black shadow-lg"
                onClick={onGoButtonClick}
              > 
                <div>
                    <svg width="5vh" height="5vh" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.33 3.66996C20.1408 3.48213 19.9035 3.35008 19.6442 3.28833C19.3849 3.22659 19.1135 3.23753 18.86 3.31996L4.23 8.19996C3.95867 8.28593 3.71891 8.45039 3.54099 8.67255C3.36307 8.89471 3.25498 9.16462 3.23037 9.44818C3.20576 9.73174 3.26573 10.0162 3.40271 10.2657C3.5397 10.5152 3.74754 10.7185 4 10.85L10.07 13.85L13.07 19.94C13.1906 20.1783 13.3751 20.3785 13.6029 20.518C13.8307 20.6575 14.0929 20.7309 14.36 20.73H14.46C14.7461 20.7089 15.0192 20.6023 15.2439 20.4239C15.4686 20.2456 15.6345 20.0038 15.72 19.73L20.67 5.13996C20.7584 4.88789 20.7734 4.6159 20.7132 4.35565C20.653 4.09541 20.5201 3.85762 20.33 3.66996ZM4.85 9.57996L17.62 5.31996L10.53 12.41L4.85 9.57996ZM14.43 19.15L11.59 13.47L18.68 6.37996L14.43 19.15Z" fill="#000000"></path> </g></svg>
                </div>
              </button>
          </div>
      </form>
    </div>
  )
}

function ChatBox({role, text, context, name}) {
  var containerClasses = `mb-2 w-11/12 p-2 shadow-lg`

  if (role === 'user') {
    containerClasses += ` bg-tangerine rounded-e-xl rounded-es-xl`
  } else {
    containerClasses += ` ml-auto bg-skyblue rounded-b-xl rounded-l-xl`
  }



  return (
    <div className={containerClasses}>

        {role === 'user' ? <p className="text-black text-xs"><b>{name}</b> (You)</p> : <p className="text-black text-xs text-right"><b>gpt-cotts</b></p>}
        <Markdown
          className="text-black"
          children={text}
          components={{
          code(props) {
            const {children, className, node, ...rest} = props
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                language={match[1]}
                style={dark}
              >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            )
          }
        }}
        />
        {context ? <ContextBox context={context}/> : null}
    </div>
  )
}

function ContextBox({context}) {
    
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
                    <p key={context_item['id']} className="mx-2 text-black shadow-lg my-2 p-2"> {context_item['text']} | This context came from the topic <b>{context_item['meta']['class']}</b></p>
                    </>
                )}
            </div>
        )
    }
}
