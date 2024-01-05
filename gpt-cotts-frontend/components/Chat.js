import { useState, useRef, useEffect } from "react"
import Markdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import Image from 'next/image'

const sendMessage = async (message, animalese, url) => {
  console.log(url)
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({message}),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    },
    body: JSON.stringify({message})
  })

  const stream = response.body.pipeThrough(new TextDecoderStream()).getReader();
  return stream
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

export default function Chat({settings}) {

  const [chats, setChats] = useState([])
  const [generating, setGenerating] = useState(false)
  const stop = useRef(false)

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



  async function makeLLMRequest(message, settings) {
    console.log(settings)
    setGenerating(true)
    stop.current = false
    let stream;
    if (settings.rag) {
      stream =  await sendMessage(message, settings.animalese, `${process.env.NEXT_PUBLIC_API_URL}/rag`)
    } else {
      stream = await sendMessage(message, settings.animalese, `${process.env.NEXT_PUBLIC_API_URL}/llm`)
    }
    
    let response = ""
    let { value, done } = await stream.read();
    if (done | stop.current) {
      return response;
    }
    response += value;
    setChats((prevChats) => [...prevChats, {role: 'assistant', text: response, id: Date.now()}])

    while (true) {
      let { value, done } = await stream.read();
      if (done | stop.current) {
        stop.current = false
        setGenerating(false)
        break;
      }
      response += value;
      setChats((prevChats) => [...prevChats.slice(0, prevChats.length - 1), {role: 'assistant', text: response, id: Date.now()}])
    }
  }

  function onChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const chatBox = {role: 'user', text: chatInput.value, id: Date.now()};
    setChats((prevChats) => [...prevChats, chatBox]);
    makeLLMRequest(chatInput.value, settings);
  }

  function onStopButtonClick() {
    stop.current = true
  }

  function onClearButtonClick() {
    stop.current = true
    setChats([])
    pingServer(`${process.env.NEXT_PUBLIC_API_URL}/clear`)
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <Image className="pt-52" src="/imgs/for_valued_member.png" alt="logo" width="500" height="500" />
        <div className="fixed inset-x-0 bottom-5">
          <ChatForm onChatSubmit={onChatSubmit} />
        </div>
      </div>
    )
  } else {
    return (
      <div className="fixed inset-x-0 bottom-5">
        <div className="flex flex-col py-2 px-20 mt-2" id="chat-boxes">
          {chats.map((chat) => (
            <ChatBox key={chat.id} role={chat.role} text={chat.text}/>
          ))}
        </div>
        <div className="flex items-center justify-center w-100">
          <button id="stopGenerateButton" className="px-4 bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-500 rounded border border-2 text-white hidden" onClick={onStopButtonClick}>
            <b>stop generating</b>
          </button>
          <button id="clearButton" className="px-4 bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-500 rounded border border-2 text-white ml-2 hidden" onClick={onClearButtonClick}>
            <b>clear</b>
          </button>
        </div>
        <ChatForm onChatSubmit={onChatSubmit} />
      </div>
    )  
  }
}


function ChatForm({onChatSubmit}) {
  
  function resetChatInput() {
    const chatInput = document.getElementById('chat-input');
    chatInput.value = ""
    chatInput.style.height = "50px"
  }

  function onGoButtonClick(e) {
    onChatSubmit(e)
    resetChatInput()
  }

  function adjustHeight(el){
      el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";
  }

  function onEnterPress(e) {
    if(e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      onChatSubmit(e)
      resetChatInput()
    }
  }
 
  return (
    <div className="flex justify-center m-4">
      <form>
        <div className="flex space-x-4 justify-center" style={{"width": "75vh"}}>
          <textarea
            className="p-2 border border-gray-300 rounded text-black h-10 w-3/4"
            type="text"
            id="chat-input"
            placeholder="What's the issue?"
            onKeyUp={(e) => adjustHeight(e.target)}
            onKeyDown={(e) => onEnterPress(e)}
          />
        <button
          className="px-4 bg-purple-600 hover:bg-purple-500 rounded border border-purple-600 border-2 text-black"
          onClick={onGoButtonClick}
        >
          <b>Go!</b>
        </button>
        </div>
      </form>
    </div>
  )
}

function ChatBox({role, text}) {
  var containerClasses = `border rounded border-2 mb-2 w-3/4 p-2`

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
