import { useState, useEffect, useRef } from "react"

export function Settings({onSettingsChange}) {

  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    rag: true,
    gpt4: false
  })
  const didMount = useRef(false);

  useEffect(() => {
    onSettingsChange(settings)
  }, [settings])

  function handleToggle() {
    setIsOpen(!isOpen)
  }

  function handleCheckboxChange(setting) {
      if (setting === 'RAG') {
        setSettings({...settings, rag: !settings.rag})
      } else if (setting === 'GPT4') {
        setSettings({...settings, gpt4: !settings.gpt4})
      }
  }
  
  return (
    <>
      <button
        className={`border-fuchsia-500 border border-2 rounded p-2 mt-2 text-black hover:bg-fuchsia-400 ${ isOpen ? 'bg-fuchsia-400' : 'bg-fuchsia-500'}`}
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded="true"
      >
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      </button>
      { isOpen && ( 
        <div className="absolute right-5 top-48 py-2 px-4 space-y-2 shadow-lg bg-white border border-gray-300 rounded-md ">
          <div className="p-2">
            <label className="flex-col items-center">
              <div>
                  <input
                    type="checkbox"
                    checked={settings.rag}
                    className="form-checkbox"
                    onChange={() => handleCheckboxChange('RAG')}
                  />
                  <span className="ml-2 text-black">query over your own notes?</span>
              </div>
              <div>
                  <input
                    type="checkbox"
                    checked={settings.gpt4}
                    className="form-checkbox"
                    onChange={() => handleCheckboxChange('GPT4')}
                  />
                  <span className="ml-2 text-black">use GPT-4?</span>
              </div>
            </label>
          </div>
        </div>
      )}
        
    </>
    
  )
}

