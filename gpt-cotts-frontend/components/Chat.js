import { useState } from "react"
import { PacmanLoader } from "react-spinners";

const USERCOLOR = '#FFFFFF'
const AICOLOR = '#d946ef'

export default function Chat({settings}) {

  const [chats, setChats] = useState([])

  function makeLLMRequest(text, settings) {
    setChats((prevChats) => [...prevChats, {user: false, text: '', id: Date.now(), loading: true}]);
    // make some async call to my FastAPI and wait for the response
    // once received, remove the loading message and add the response
    // to the chat box
    // for now lets just add a 2 second delay
    setTimeout(() => {
      setChats((prevChats) => [...prevChats.slice(0, -1)]);
      setChats((prevChats) => [...prevChats, {user: false, text: 'response', id: Date.now(), loading: false}]);
    }, 10000);
  }

  function onChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const chatBox = {user: true, text: chatInput.value, id: Date.now(), loading: false};
    setChats((prevChats) => [...prevChats, chatBox]);
    makeLLMRequest(chatInput.value, settings);
  }

  return (
    <>
      <ChatForm onChatSubmit={onChatSubmit} />
      <div className="flex flex-col py-2 px-20 mt-2" id="chat-boxes">
        {chats.map((chat) => (
          <ChatBox key={chat.id} user={chat.user} text={chat.text} loading={chat.loading} />
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

function ChatBox({user, text, loading}) {
  var containerClasses = `text-left border rounded border-2 mb-2 w-1/2 p-2`

  if (user === true) {
    containerClasses += ` bg-white border-fuchsia-500`
  } else {
    containerClasses += ` ml-auto bg-fuchsia-500 border-white`
  }


  return (
    <div className={containerClasses}>
      {loading ? <PacmanLoader size={10} color="black" /> : <p className="text-black">{text}</p>}
    </div>
  )
}
