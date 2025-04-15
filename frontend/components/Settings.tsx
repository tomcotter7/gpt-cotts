import { useState, useEffect, useMemo } from "react";
import { HideIcon, ShowIcon, RubberDuckIcon } from "@/components/Icons"
import Modal from '@mui/material/Modal';
import { useSettings } from "@/providers/Settings";
import debounce from 'lodash/debounce';
import { useSession } from "next-auth/react";

async function updateCurrentUserSettings(access_token: string, settings: SettingsInterface): Promise<boolean> {
  try {
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      body: JSON.stringify(settings)
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user_data/settings`, requestOptions)
    return response.ok
  } catch {
    return false;
  }
}


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

export function SettingsDisplay() {

  const [showSettings, setShowSettings] = useState(false);
  const [userModified, setUserModified] = useState(false);
  const { settings, updateSettings } = useSettings();
  const { data: session } = useSession();

  const debouncedUpdateSettings = useMemo(
    () => debounce((token: string, settings: SettingsInterface) => {
      updateCurrentUserSettings(token, settings)
    }, 5000),
    []
  );


  useEffect(() => {
    if (session != null && userModified) {
      debouncedUpdateSettings(session.access_token, settings)
      setUserModified(false)
    }
  }, [settings, debouncedUpdateSettings, userModified, session])

  function handleLLMDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const modelName = event.target.value;
    if (!reasoningModels.includes(modelName)) {
      updateSettings({
        model: event.target.value,
        viewReasoning: false,
        reasoningLevel: 0,
      })
    } else {
      updateSettings({ model: event.target.value })
    }

    setUserModified(true)
  }

  function handleRerankDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
    updateSettings({ rerankModel: event.target.value })
    setUserModified(true)
  }

  function handleSlideChange<K extends keyof SettingsInterface>(event: React.ChangeEvent<HTMLInputElement>, settingName: K) {
    updateSettings({
      [settingName]: parseInt(event.target.value)
    })
    setUserModified(true)
  }

  function handleCheckboxSettingChange<K extends keyof SettingsInterface>(settingName: K) {
    return () => {
      updateSettings({
        [settingName]: !settings[settingName]
      });
      setUserModified(true)
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
    <Modal open={showSettings} className="flex items-center justify-center">
      <div className="flex flex-col bg-skyblue-dark border border-skyblue-dark w-1/2 rounded p-2">
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
              onChange={handleCheckboxSettingChange("rag")}
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
              <option value="gpt-4.1-2025-04-14">gpt-4.1-mini</option>
              <option value="gpt-4.1-2025-04-14">gpt-4.1</option>
              <option value="gemini-2.5-pro-preview-03-25">gemini-2.5-pro</option>
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
    </Modal>
  )

}
