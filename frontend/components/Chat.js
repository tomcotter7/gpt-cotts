import { useState, useRef, useEffect } from "react"
import Markdown from 'react-markdown'
import { Settings } from '@/components/Settings'
import { ToastBox } from '@/components/Toast'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import Image from 'next/image'
import axios from 'axios'


const sendMessage = async (raw_request, url) => {
  // const token = localStorage.getItem('token')
  const raw = JSON.stringify(raw_request);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cache-Control", "no-cache");
  myHeaders.append("Connection", "keep-alive");

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  const response = await fetch(url, requestOptions)
  
  if (response.ok) {
    const stream = response.body.pipeThrough(new TextDecoderStream()).getReader();
    return stream
  } else {
    if (response.status === 401) {
      return "unauthorized"
    }
  }
}

const pingServer = async (url) => {
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    },
    body: JSON.stringify({})
  })
}

export default function Chat() {

  const [chats, setChats] = useState([])
  const [generating, setGenerating] = useState(false)
  const stop = useRef(false)
  const [settings, setSettings] = useState({
    rag: true
  })

  const [toasts, setToasts] = useState({})

  function setDisabled(button) {
    button.classList.add('hidden')
  }

  function setEnabled(button) {
    button.classList.remove('hidden')
  }

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



  async function makeLLMRequest(request, settings) {
    setGenerating(true)
    stop.current = false
    let stream;
    if (settings.rag) {
      stream =  await sendMessage(request, `${process.env.NEXT_PUBLIC_API_URL}/generation/rag`)
    } else {
      stream = await sendMessage(request, `${process.env.NEXT_PUBLIC_API_URL}/generation/base`)
    }

    if (stream === "unauthorized") {
      setGenerating(false)
      setToasts({...toasts, [Date.now()]: {message: "You are not authorized to perform this action. pm us on Twitter to get access to the beta - @_tcotts or @luizayaara", success: false}})
      setChats([])
      return
    }
    
    let response = ""
    let { value, done } = await stream.read();
    if (done | stop.current) {
      return response;
    } 
    response += value;
    setChats((prevChats) => [{role: 'assistant', content: response, id: Date.now()}, ...prevChats])
    const search = "<EOS><SOC>"
    while (true) {
      let { value, done } = await stream.read();
      if (done | stop.current) {
        stop.current = false
        setGenerating(false)
        break;
      }
        
      const pos = value.indexOf(search)
        if (pos !== -1) {
          response += value.substring(0, pos)
          const context = value.substring(pos + search.length, value.length)
          console.log(context)
        } else {
          response += value;
        }
      setChats((prevChats) => [{role: 'assistant', content: response, id: Date.now()}, ...prevChats.slice(1, prevChats.length)])
    }
  }

  function onChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const chatBox = {role: 'user', content: chatInput.value, id: Date.now()};
    const newChats = [chatBox, ...chats]
    setChats(newChats);
    makeLLMRequest({query: chatInput.value, history: newChats}, settings);
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
          <div className="flex m-4 justify-end">
            <Settings onSettingsChange={handleSettingsChange}/>
          </div>
          <div className="m-4 grow">
            <div className="flex justify-center">
              <Image
                  src="/imgs/for_valued_member.png"
                  alt="logo"
                  width={1000}
                  height={25}
                  quality={100}
                />
            </div>
          </div>
          <div className="m-4">
            <ChatForm onChatSubmit={onChatSubmit} onSettingsChange={handleSettingsChange} />
          </div>
        </div>
      </>
    )
  } else {
    return (
      <div className="lg:w-screen w-11/12 h-full flex flex-col">
        <div className="flex m-4 justify-end">
          <Settings onSettingsChange={handleSettingsChange}/>
        </div>
        <div className="m-4 grow h-4/6">
          <div className="flex flex-col-reverse mx-2 overflow-y-auto max-h-full" id="chat-boxes">
            {chats.map((chat) => (
              <ChatBox key={chat.id} role={chat.role} text={chat.content}/>
            ))}
          </div>
        </div>
        <div >
          <div className="flex items-center justify-center m-4">
            <button
              id="stopGenerateButton"
              className="px-4 bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-500 rounded border border-2 text-white hidden"
              onClick={onStopButtonClick}
            >
              <b>stop</b>
            </button>
            <button
              id="clearButton"
              className="px-4 bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-500 rounded border border-2 text-white ml-2 hidden"
              onClick={onClearButtonClick}
            >
              <b>clear</b>
            </button>
          </div>
          <ChatForm onChatSubmit={onChatSubmit}  />
        </div>
      </div>
    )  
  }
}


function ChatForm({onChatSubmit}) {

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
      el.style.height = (el.scrollHeight)+"px"
  }

  function onEnterPress(e) {
    if(e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      onChatSubmit(e)
      resetChatInput()
    }
  }
 
  return (
    <>
      <form>
        <div className="flex space-x-4 mx-4">
          <textarea
            className="p-2 rounded text-black w-full"
            type="text"
            id="chat-input"
            placeholder="What's the issue?"
            onKeyUp={(e) => adjustHeight(e.target)}
            onKeyDown={(e) => onEnterPress(e)}
          />
          <button
            className="px-4 bg-purple-600 hover:bg-purple-500 rounded border border-2 border-purple-600 text-black"
            onClick={onGoButtonClick}
          >
            <b>Go!</b>
          </button>
        </div>
      </form>
    </>
  )
}

function ChatBox({role, text}) {
  var containerClasses = `border rounded border-2 mb-2 w-11/12 p-2`

  if (role === 'user') {
    containerClasses += ` bg-white border-fuchsia-500`
  } else {
    containerClasses += ` ml-auto bg-fuchsia-500 border-white`
  }

  return (
    <div className={containerClasses}>
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
    </div>
  )
}
