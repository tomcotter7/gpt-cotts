import { useState, useEffect, useRef } from "react"

export function Settings({onSettingsChange, passed_settings}) {

  const [settings, setSettings] = useState({
    rag: passed_settings.rag,
    gpt4: passed_settings.gpt4,
    slider: passed_settings.slider
  })
  const didMount = useRef(false);

  useEffect(() => {
      onSettingsChange(settings)
  }, [settings])

  function handleCheckboxChange(setting) {
      if (setting === 'RAG') {
        setSettings({...settings, rag: !settings.rag})
      } else if (setting === 'GPT4') {
        setSettings({...settings, gpt4: !settings.gpt4})
      }
  }

    function handleSlideChange(event) {
        setSettings({...settings, slider: parseInt(event.target.value)})
    }
  
  return (
    <div className="flex justify-center bg-spearmint">
        <form>
            <label htmlFor="rag">
                <span className="ml-2 text-black">query over your own notes?</span>
            </label>
            <input
                id="rag"
                type="checkbox"
                checked={settings.rag}
                className="form-checkbox m-2"
                onChange={() => handleCheckboxChange('RAG')}
            />
            <label htmlFor="gpt4">
                <span className="ml-2 text-black">use GPT-4?</span>
            </label>
            <input
                id="gpt4"
                type="checkbox"
                checked={settings.gpt4}
                className="form-checkbox m-2"
                onChange={() => handleCheckboxChange('GPT4')}
            />
            <label htmlFor="slider">
                <span className="ml-2 text-black">what's your expertise on the topic?</span>
            </label>
            <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={settings.slider}
                className="m-2"
                onChange={handleSlideChange}
            />
        </form>
    </div>
    
  )
}

