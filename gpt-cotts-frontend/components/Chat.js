import { useState, useRef, useEffect } from "react"
import Markdown from 'react-markdown'
import { Settings } from '@/components/Settings'
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

export default function Chat() {

  const [chats, setChats] = useState([])
  const [generating, setGenerating] = useState(false)
  const stop = useRef(false)
  const [settings, setSettings] = useState({
    rag: true
  })

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
    setChats((prevChats) => [{role: 'assistant', text: response, id: Date.now()}, ...prevChats])

    while (true) {
      let { value, done } = await stream.read();
      if (done | stop.current) {
        stop.current = false
        setGenerating(false)
        break;
      }
      response += value;
      setChats((prevChats) => [{role: 'assistant', text: response, id: Date.now()}, ...prevChats.slice(1, prevChats.length)])
    }
  }

  function onChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const chatBox = {role: 'user', text: chatInput.value, id: Date.now()};
    setChats((prevChats) => [chatBox, ...prevChats]);
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

  function handleSettingsChange(newSettings) {
    setSettings(newSettings)
  }

  if (chats.length === 0) {
    return (
      <div className="lg:w-screen w-11/12">
        <div className="flex m-4 justify-end">
          <Settings onSettingsChange={handleSettingsChange}/>
        </div>
        <div className="flex justify-center xl:mt-88 lg:mt-80 md:mt-64 mt-48">
          <Image
              src="/imgs/for_valued_member.png"
              alt="logo"
              width={500}
              height={500}
            />
        </div>
        <div className="fixed bottom-5" style={{width: 'inherit'}}>
          <ChatForm onChatSubmit={onChatSubmit} onSettingsChange={handleSettingsChange} />
        </div>
      </div>
    )
  } else {
    return (
      <div className="lg:w-screen w-11/12">
        <div className="flex m-4 justify-between">
          <p className="m-4 text-xl" ><b><u>skill issues? Use me</u></b></p>
          <Settings onSettingsChange={handleSettingsChange}/>
        </div>

        <div className="fixed bottom-5" style={{width: 'inherit'}}>
          <div className="flex flex-col-reverse mx-4 overflow-y-auto 2xl:max-h-[135rem] xl:max-h-[86rem] lg:max-h-[71rem] md:max-h-[43rem] sm:max-h-[32rem]" id="chat-boxes">
            {chats.map((chat) => (
              <ChatBox key={chat.id} role={chat.role} text={chat.text}/>
            ))}
          </div>
          <div className="flex items-center justify-center m-2">
            <button id="stopGenerateButton" className="px-4 bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-500 rounded border border-2 text-white hidden" onClick={onStopButtonClick}>
              <b>stop</b>
            </button>
            <button id="clearButton" className="px-4 bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-500 rounded border border-2 text-white ml-2 hidden" onClick={onClearButtonClick}>
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
