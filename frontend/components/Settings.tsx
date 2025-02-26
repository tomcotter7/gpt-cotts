import { useState, useEffect, useCallback } from "react";
import { HideIcon, ShowIcon, RubberDuckIcon } from "@/components/Icons"

const reasoningModels = ["claude-3-7-sonnet-20250219"]

export interface SettingsInterface {
  rag: boolean;
  rubberDuck: boolean;
  expertiseSlider: number;
  model: string;
  rerankModel: string;
  autoSave: boolean;
  reasoningLevel: number
  viewReasoning: boolean
}

interface SettingsProps {
  settings: SettingsInterface;
  onSettingsChange: (settings: SettingsInterface) => void;
}

export function SettingsDisplay({ settings, onSettingsChange }: SettingsProps) {

  const [showSettings, setShowSettings] = useState(false);

  const handleRAGCheckboxChange = useCallback(() => {
    onSettingsChange({ ...settings, rag: !settings.rag });
  }, [settings, onSettingsChange]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "r" && e.altKey) {
        e.preventDefault();
        handleRAGCheckboxChange();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRAGCheckboxChange]);

  function handleLLMDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const modelName = event.target.value;
    if (!reasoningModels.includes(modelName)) {
      onSettingsChange({
        ...settings,
        model: event.target.value,
        viewReasoning: false,
        reasoningLevel: 0,
      })
    } else {
      onSettingsChange({ ...settings, model: event.target.value })
    }
  }

  function handleRerankDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onSettingsChange({ ...settings, rerankModel: event.target.value })
  }

  function handleSlideChange<K extends keyof SettingsInterface>(event: React.ChangeEvent<HTMLInputElement>, settingName: K) {
    onSettingsChange({
      ...settings,
      [settingName]: parseInt(event.target.value)
    })
  }

  function handleCheckboxSettingChange<K extends keyof SettingsInterface>(settingName: K) {
    return () => {
      onSettingsChange({
        ...settings,
        [settingName]: !settings[settingName]
      });
    };
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
            <option value="gpt-4o-mini-2024-07-18">gpt-4o-mini</option>
            <option value="gpt-4o-2024-08-06">gpt-4o</option>
            <option value="deepseek-chat">deepseek-chat</option>
            <option value="claude-3-5-haiku-20241022">claude3.5-haiku</option>
            <option value="claude-3-5-sonnet-20241022">claude3.5-sonnet</option>
            <option value="claude-3-7-sonnet-20250219">claude3.7-sonnet</option>
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
            onChange={(e) => handleSlideChange(e, 'expertiseSlider')}
          />
        </div>
        <div className="flex flex-wrap justify-center">
          <label htmlFor="rubberDuckMode"><RubberDuckIcon /></label>
          <input
            id="rubberDuckMode"
            type="checkbox"
            checked={settings.rubberDuck}
            className="form-checkbox mx-2 accent-tangerine rounded focus:ring-tangerine-dark focus:ring-1"
            onChange={handleCheckboxSettingChange('rubberDuck')}
          />
        </div>
        <div className="flex flex-wrap justify-center">
          <label htmlFor="autoSave"><span className="text-black">auto save your notes?</span></label>
          <input
            id="autoSave"
            type="checkbox"
            checked={settings.autoSave}
            className="form-checkbox mx-2 accent-tangerine rounded focus:ring-tangerine-dark focus:ring-1"
            onChange={handleCheckboxSettingChange('autoSave')}
          />
        </div>
        {reasoningModels.includes(settings.model) ?
          <div className="flex flex-wrap justify-center">
            <label htmlFor="reasoningLevel"><span className="text-black">how much should the model reason?</span></label>
            <input
              id="slider"
              type="range"
              min="0"
              max="100"
              step="25"
              value={settings.reasoningLevel}
              className="h-3 m-2 cursor-pointer appearance-none rounded-md accent-tangerine"
              onChange={(e) => handleSlideChange(e, 'reasoningLevel')}
            />
          </div>
          : null}
        {settings.rag ?
          <div className="text-center">
            <label htmlFor="rerank_model"> <span className="ml-2 text-black">which model to use for reranking? </span> </label>
            <select id="rerank_model" value={settings.rerankModel} onChange={handleRerankDropdownChange} className={selectTailwind}>
              <option value="cohere">cohere</option> <option value="flashrank">flashrank</option>
            </select>
          </div>
          : null}
        {settings.reasoningLevel > 0 ?
          <div className="flex flex-wrap justify-center">
            <label htmlFor="viewReasoning"><span className="text-black">view the reasoning tokens?</span></label>
            <input
              id="viewReasoning"
              type="checkbox"
              checked={settings.viewReasoning}
              className="form-checkbox mx-2 accent-tangerine rounded focus:ring-tangerine-dark focus:ring-1"
              onChange={handleCheckboxSettingChange('viewReasoning')}
            />
          </div>
          : null}
      </form>
      <div className="flex justify-center items-center py-1">
        <button className="bg-skyblue-dark hover:bg-skyblue text-black rounded" onClick={() => setShowSettings(false)}><HideIcon /></button>
      </div>


    </div>

  )

}
