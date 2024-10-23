import { useState, useEffect } from "react";
import { HideIcon, ShowIcon, RubberDuckIcon } from "@/components/Icons"

export interface SettingsInterface {
    rag: boolean;
    rubberDuck: boolean;
    expertiseSlider: number;
    model: string;
    rerankModel: string;
}

interface SettingsProps {
    passedSettings: SettingsInterface;
    onSettingsChange: (settings: SettingsInterface) => void;
}

export function SettingsDisplay({ onSettingsChange, passedSettings}: SettingsProps) {
    
    const [settings, setSettings] = useState<SettingsInterface>(passedSettings);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "r" && e.altKey) {
                e.preventDefault();
                setSettings((prev) => ({...prev, rag: !prev.rag}));
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setSettings])

    useEffect(() => {
        onSettingsChange(settings);
    }, [settings, onSettingsChange])

    function handleRAGCheckboxChange() {
        setSettings({...settings, rag: !settings.rag})
    }

    function handleLLMDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setSettings({...settings, model: event.target.value})
    }

    function handleRerankDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setSettings({...settings, rerankModel: event.target.value})
    }

    function handleSlideChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSettings({...settings, expertiseSlider: parseInt(event.target.value)})
    }

    function handleRubberDuckCheckboxChange() {
        setSettings({...settings, rubberDuck: !settings.rubberDuck})
    }

    if (!showSettings) {
        return (
            <div className="flex justify-center bg-skyblue-dark border-t border-skyblue-dark">
                <button
                    className="hover:bg-skyblue text-black rounded p-1"
                    onClick={() => setShowSettings(true)}
                >
                    <ShowIcon />
                </button>
            </div>
        )
    }
    const selectTailwind = "bg-tangerine border border-tangerine-dark text-black rounded focus:ring-tangerine-dark mx-2"
  
    return (
      <div className="flex flex-col justify-center bg-skyblue-dark border-t border-skyblue-dark">
        <form className="max-w-md mx-auto">
            <div className="flex flex-wrap justify-center items-center">
              <label htmlFor="rag">
                  <span className="text-black">query over your own notes?</span>
              </label>
              <input
                  id="rag"
                  type="checkbox"
                  checked={settings.rag}
                  className="form-checkbox mx-2 accent-tangerine rounded focus:ring-tangerine-dark focus:ring-1"
                  onChange={() => handleRAGCheckboxChange()}
              />
            </div>
            <div className="flex flex-wrap justify-center items-center">
              <label htmlFor="model">
                  <span className="text-black">which model to use? </span>
              </label>
              <select
                  id="model"
                  value={settings.model}
                  onChange={handleLLMDropdownChange}
                  className={selectTailwind}
              >
                  <option value="gpt-3.5-turbo-0125">gpt-3.5</option>
                  <option value="gpt-4-0125-preview">gpt-4</option>
                  <option value="deepseek-coder">deepseek-coder</option>
                  <option value="claude-3-haiku-20240307">claude3-haiku</option>
                  <option value="claude-3-5-sonnet-20241022">claude3.5-sonnet</option>
              </select>
            </div>
            <div className="flex flex-wrap justify-center items-center">
              <label htmlFor="slider">
                  <span className="text-black">what&apos;s your expertise on the topic?</span>
              </label>
              <input
                    id="slider"
                  type="range"
                  min="0"
                  max="100"
                  step="25"
                  value={settings.expertiseSlider}
                  className="h-3 m-2 cursor-pointer appearance-none rounded-md accent-tangerine"
                  onChange={handleSlideChange}
              />
            </div>
            <div className="flex flex-wrap justify-center">
                <label htmlFor="rubberDuckMode"><RubberDuckIcon /></label>
                <input
                    id="rubberDuckMode"
                    type="checkbox"
                    checked={settings.rubberDuck}
                    className="form-checkbox mx-2 accent-tangerine rounded focus:ring-tangerine-dark focus:ring-1"
                    onChange={handleRubberDuckCheckboxChange}
                />
            </div>
              { settings.rag ? <div className="text-center"> <label htmlFor="rerank_model"> <span className="ml-2 text-black">which model to use for reranking? </span> </label> <select id="rerank_model" value={settings.rerankModel} onChange={handleRerankDropdownChange} className={selectTailwind}> <option value="cohere">cohere</option> <option value="flashrank">flashrank</option> </select> </div> : null }
          </form>
        <div className="flex justify-center items-center py-1">
            <button className="bg-skyblue-dark hover:bg-skyblue text-black rounded" onClick={() => setShowSettings(false)}><HideIcon /></button>
        </div>
                

      </div>
      
    )

}
