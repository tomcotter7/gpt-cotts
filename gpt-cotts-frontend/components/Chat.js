import { useState, useRef } from "react"
import Markdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'

const USERCOLOR = '#FFFFFF'
const AICOLOR = '#d946ef'

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


export default function Chat({settings}) {

  const [chats, setChats] = useState([])
  const stop = useRef(false)

  async function makeLLMRequest(message, settings) {
    let stream;
    if (settings.rag) {
      stream =  await sendMessage(message, settings.animalese, "http://localhost:8000/rag")
    } else {
      stream = await sendMessage(message, settings.animalese, "http://localhost:8000/llm")
    }
    
    let response = ""
    let { value, done } = await stream.read();
    if (done | stop.current) {
      return response;
    }
    response += value;
    setChats((prevChats) => [{role: 'assistant', text: response, id: Date.now()},
      ...prevChats]) 

    while (true) {
      let { value, done } = await stream.read();
      if (done | stop.current) {
        stop.current = false
        break;
      }
      response += value;
      setChats((prevChats) => [{role: 'assistant', text: response, id: Date.now()},
        ...prevChats.slice(1, prevChats.length)])
    }
  }

  function onChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const chatBox = {role: 'user', text: chatInput.value, id: Date.now()};
    setChats((prevChats) => [chatBox, ...prevChats]);
    makeLLMRequest(chatInput.value, settings);
  }

  function onStopButtonClick(e) {
    stop.current = true
  }

  return (
    <>
      <ChatForm onChatSubmit={onChatSubmit} />
      <div className="flex items-center justify-center w-100">
        <button
          className="px-4 mt-2 bg-black hover:bg-gray-400 rounded border border-fuchsia-500 border-2 text-white"
          onClick={onStopButtonClick}
        >
          <b>stop generating</b>
        </button>
      </div>
      <div className="flex flex-col py-2 px-20 mt-2" id="chat-boxes">
        {chats.map((chat) => (
          <ChatBox key={chat.id} role={chat.role} text={chat.text}/>
        ))}
      </div>
    </>
  )
}


function ChatForm({onChatSubmit}) {

  function onGoButtonClick(e) {
    onChatSubmit(e)
  }

  return (
    <div className="flex items-center justify-center w-100">
      <form className="flex space-x-4">
        <input
          className="p-2 border border-gray-300 rounded text-black"
          type="text"
          id="chat-input"
          placeholder="What's the issue?"
        />
        <button
          className="px-4 bg-fuchsia-500 hover:bg-fuchsia-300 rounded border border-fuchsia-500 border-2 text-black"
          onClick={onGoButtonClick}
        >
          <b>Go!</b>
        </button>
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
