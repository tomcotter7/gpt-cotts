import { useState, useEffect, useRef } from "react"

export function Settings({onSettingsChange}) {
  
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    rag: true,
    animalese: false
  })
  const didMount = useRef(false);

  useEffect(() => {
    onSettingsChange(settings)
  }, [settings])

  function handleToggle() {
    setIsOpen(!isOpen)
  }

  function handleCheckboxChange(setting) {
    if (setting === "RAG") {
      setSettings({...settings, rag: !settings.rag})
    }
  
  }


  return (
    <>
      <button
        className={`border-fuchsia-500 border border-2 rounded p-2 mt-2 text-white hover:bg-fuchsia-400 ${ isOpen ? 'bg-fuchsia-400' : 'bg-fuchsia-500'}`}
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded="true"
      >
      <b>Settings</b>
      </button>
      { isOpen && ( 
        <div className="absolute right-5 top-40 py-2 px-4 space-y-2 shadow-lg bg-white border border-gray-300 rounded-md ">
          <b className="text-black"><u>Settings</u></b>
          <div className="p-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={settings.rag}
                className="form-checkbox"
                onChange={() => handleCheckboxChange('RAG')}
              />
              <span className="ml-2 text-black">Use RAG?</span>
            </label>
          </div>
        </div>
      )}
        
    </>
    
  )
}

