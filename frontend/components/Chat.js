import { useState, useRef, useEffect } from "react"
import { useSession } from 'next-auth/react'
import Markdown from 'react-markdown'
import { Settings } from '@/components/Settings'
import { updateToasts, ToastBox } from '@/components/Toast'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import Image from 'next/image'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import { RubberDuckIcon, SendIcon } from '@/components/Icons'

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
        expertise_slider: 50,
        rerank_model: "cohere",
        rubber_duck_mode: false
    })


    const [toasts, setToasts] = useState([])
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
        updateToasts("Your session has expired. Please log in again.", false, setToasts)
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
            expertise: convertSliderToExpertise(settings.expertise_slider),
            rubber_duck_mode: settings.rubber_duck_mode,
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
        <div className="md:w-screen w-11/12 h-full flex flex-col">
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
      Currently using <b>{settings.rag ? "rag" : "no rag"}</b> with <b>{ settings.model }</b> with <b> { convertSliderToExpertise(settings.expertise_slider) } </b> expertise{settings.rag ? ` and reranking with` : ""}{settings.rag ? <b> {settings.rerank_model}</b> : ""}.
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
                className="w-1/12 bg-tangerine hover:bg-tangerine-dark rounded border border-2 border-tangerine text-black shadow-lg"
                onClick={onGoButtonClick}
              > 
                <div className="flex justify-center ">
                    { settings.rubber_duck_mode ? <RubberDuckIcon height={48} width={48}/> : <SendIcon /> }
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
