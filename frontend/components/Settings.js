import { useState, useEffect, useRef } from "react"

export function Settings({onSettingsChange, passed_settings}) {

  const [settings, setSettings] = useState({
      rag: passed_settings.rag,
      model: passed_settings.model,
      rerank_model: passed_settings.rerank_model, 
      slider: passed_settings.slider
  })
  const didMount = useRef(false);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'r' && e.altKey) {
                e.preventDefault()
                setSettings((prevSettings) => {
                    return {...prevSettings, rag: !prevSettings.rag}
                })
            } 
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])


  useEffect(() => {
      onSettingsChange(settings)
  }, [settings])

    function handleRAGCheckboxChange() {
        setSettings({...settings, rag: !settings.rag})
    }

    function handleLLMDropdownChange(event) {
        setSettings({...settings, model: event.target.value})
    }

    function handleRerankDropdownChange(event) {
        setSettings({...settings, rerank_model: event.target.value})
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
                onChange={() => handleRAGCheckboxChange('RAG')}
            />
            <label htmlFor="model">
                <span className="ml-2 text-black">which model to use? </span>
            </label>
            <select
                id="model"
                value={settings.model}
                onChange={handleLLMDropdownChange}
                className="text-black"
            >
                <option value="gpt-3.5-turbo-0125">gpt-3.5</option>
                <option value="gpt-4-0125-preview">gpt-4</option>
                <option value="deepseek-coder">deepseek-coder</option>
                <option value="claude-3-haiku-20240307">claude3-haiku</option>
                <option value="claude-3-5-sonnet-20240620">claude3.5-sonnet</option>
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
            { settings.rag ? <div className="text-center"> <label htmlFor="rerank_model"> <span className="ml-2 text-black">which model to use for reranking? </span> </label> <select id="rerank_model" value={settings.rerank_model} onChange={handleRerankDropdownChange} className="text-black"> <option value="cohere">cohere</option> <option value="flashrank">flashrank</option> </select> </div> : null }
        </form>
    </div>
    
  )
}

