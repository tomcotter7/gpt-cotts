export function ChatForm({settings}) {

  function onChatSubmit(e) {
    e.preventDefault()
    console.log(settings)
  }

  return (
    <div className="flex items-center justify-center">
      <form className="flex space-x-4">
        <input
          className="p-2 border border-gray-300 rounded text-black"
          type="text"
          placeholder="What's the issue?"
        />
        <button
          className="px-4 py-2 bg-black-500 hover:bg-fuchsia-500 rounded border border-solid border-fuchsia-500 border-2 text-black"
          onClick={onChatSubmit}
        >
          Go!
        </button>
      </form>
    </div>
  )
}
