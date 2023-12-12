import { useState } from "react"
import { PacmanLoader } from "react-spinners";
import Markdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'

const USERCOLOR = '#FFFFFF'
const AICOLOR = '#d946ef'

const sendMessage = async (message) => {
  console.log(JSON.stringify({message}))
  const response = await fetch('http://localhost:8000/llm', {
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
  const [stop, setStop] = useState(false)

  async function makeLLMRequest(message, settings) {
    const stream = await sendMessage(message)
    let response = ""
    let first = true
    while (true) {
      let { value, done } = await stream.read();
      if (done|stop) break;
      response += value;
      console.log(response)
      if (!first) { 
        setChats((prevChats) => [{role: 'assistant', text: response, id: Date.now(), loading: false},
        ...prevChats.slice(1, prevChats.length)]) 
      } else {
        setChats((prevChats) => [{role: 'assistant', text: response, id: Date.now(), loading: false},
        ...prevChats]);
      }
      first = false;
    }
  }

  function onChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const chatBox = {role: 'user', text: chatInput.value, id: Date.now(), loading: false};
    setChats((prevChats) => [chatBox, ...prevChats]);
    makeLLMRequest(chatInput.value, settings);
  }

  return (
    <>
      <ChatForm onChatSubmit={onChatSubmit} />
      <div className="flex flex-col py-2 px-20 mt-2" id="chat-boxes">
        {chats.map((chat) => (
          <ChatBox key={chat.id} role={chat.role} text={chat.text} loading={chat.loading} />
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
    <div className="flex items-center justify-center">
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

function ChatBox({role, text, loading}) {
  var containerClasses = `text-left border rounded border-2 mb-2 w-1/2 p-2`

  if (role === 'user') {
    containerClasses += ` bg-white border-fuchsia-500`
  } else {
    containerClasses += ` ml-auto bg-fuchsia-500 border-white`
  }
  
  if (loading) {
    return (
      <div className={containerClasses}>
        <PacmanLoader size={10} color="black" />
      </div>
    )
  } else {
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
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
                style={dark}
              />
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
}
