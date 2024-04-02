import { useState, useEffect, useRef } from "react"

export function Settings({onSettingsChange, passed_settings}) {

  const [settings, setSettings] = useState({
    rag: passed_settings.rag,
    model: passed_settings.model,
    slider: passed_settings.slider
  })
  const didMount = useRef(false);

  useEffect(() => {
      onSettingsChange(settings)
  }, [settings])

    function handleCheckboxChange() {
        setSettings({...settings, rag: !settings.rag})
    }

    function handleDropdownChange(event) {
        setSettings({...settings, model: event.target.value})
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
            <label htmlFor="model">
                <span className="ml-2 text-black">use GPT-4? </span>
            </label>
            <select
                id="model"
                value={settings.model}
                onChange={handleDropdownChange}
                className="text-black"
            >
                <option value="gpt-3.5-turbo-0125">gpt-3.5</option>
                <option value="gpt-4-0125-preview">gpt-4</option>
                <option value="claude-3-haiku-20240307">claude3-haiku</option>
                <option value="claude-3-sonnet-20240229">claude3-sonnet</option>
            </select>
                
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

