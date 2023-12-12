import { useState } from "react"

export function Settings({onSettingsChange}) {
  
  const [isOpen, setIsOpen] = useState(false)
  const [rag, setRag] = useState(false)
  const [animalese, setAnimalese] = useState(false)

  function handleToggle() {
    setIsOpen(!isOpen)
  }

  function handleCheckboxChange(setting) {
    if (setting === "RAG") {
      setRag(!rag)
    }
    if (setting === "Animalese") {
      setAnimalese(!animalese)
    }

    onSettingsChange({
      rag,
      animalese
    })
  
  }


  return (
    <>
      <button
        className={`border-fuchsia-500 border border-2 rounded p-2 mt-2 text-black hover:bg-fuchsia-300 ${ isOpen ? 'bg-fuchsia-300' : 'bg-fuchsia-500'}`}
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded="true"
      >
      <b>Settings</b>
      </button>
      { isOpen && ( 
        <div className="absolute right-5 top-20 py-2 px-4 space-y-2 shadow-lg bg-white border border-gray-300 rounded-md ">
          <b className="text-black">Settings!</b>
          <div className="p-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={rag}
                className="form-checkbox"
                onChange={() => handleCheckboxChange('RAG')}
              />
              <span className="ml-2 text-black">RAG</span>
            </label>
          </div>
          <div className="p-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={animalese}
                className="form-checkbox"
                onChange={() => handleCheckboxChange('Animalese')}
              />
              <span className="ml-2 text-black">Animalese</span>
            </label>
          </div>
        </div>
      )}
        
    </>
    
  )
}

