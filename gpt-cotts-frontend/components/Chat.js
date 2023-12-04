import { useState } from "react"
import { PacmanLoader } from "react-spinners";

export default function Chat({settings}) {

  const [chats, setChats] = useState([])

  function makeLLMRequest(text, settings) {
    setChats((prevChats) => [...prevChats, {color: 'fuchsia', text: '', id: Date.now(), loading: true}]);
    // make some async call to my FastAPI and wait for the response
    // once received, remove the loading message and add the response
    // to the chat box
    // for now lets just add a 2 second delay
    setTimeout(() => {
      setChats((prevChats) => [...prevChats.slice(0, -1)]);
      setChats((prevChats) => [...prevChats, {color: 'fuchsia', text: 'response', id: Date.now(), loading: false}]);
    }, 10000);
  }

  function onChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const chatBox = {color: 'teal', text: chatInput.value, id: Date.now(), loading: false};
    setChats((prevChats) => [...prevChats, chatBox]);
    makeLLMRequest(chatInput.value, settings);
  }

  return (
    <>
      <ChatForm onChatSubmit={onChatSubmit} />
      <div className="flex flex-col py-2 px-2 items-center justify-center mt-2" id="chat-boxes">
        {chats.map((chat) => (
          <ChatBox key={chat.id} color={chat.color} text={chat.text} loading={chat.loading} />
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
    <div className="flex py-2 px-2 items-center justify-center">
      <form className="flex space-x-4">
        <input
          className="p-2 border border-gray-300 rounded text-black"
          type="text"
          id="chat-input"
          placeholder="What's the issue?"
        />
        <button
          className="px-4 py-2 bg-black-500 hover:bg-fuchsia-500 rounded border border-solid border-fuchsia-500 border-2 text-black"
          onClick={onGoButtonClick}
        >
          Go!
        </button>
      </form>
    </div>
  )
}

function ChatBox({color, text, loading}) {
  const containerClasses = `text-left border border-gray-700 rounded border-2 bg-${color}-500 mb-2 w-1/2 p-2`

  return (
    <div className={containerClasses}>
      {loading ? <PacmanLoader size={10} color="black" /> : <p className="text-black">{text}</p>}
    </div>
  )
}
