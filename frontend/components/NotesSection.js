import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

function EditingSection({ title, content, id }) {

  const height = content.split('\n').length * 30

  return (
    <div className="flex flex-col" id={id}>
      <input
        className="border border-2 rounded px-2"
        defaultValue={title}
      />
      <textarea
        className='border border-2 rounded px-2'
        style={{ height: `${height}px` }}
        defaultValue={content}
      />
    </div>
  )
}

function MarkdownSection({ title, content }) {
  return (
    <div>
      <h1 className="text-skyblue text-center"><b> {title} </b></h1>
      <Markdown remarkPlugins={remarkMath} rehypePlugins={rehypeKatex}>
        {content}
      </Markdown>
    </div>
  )
}

export function Section({ id, title, content, onSectionSave, onSectionDelete}) {
  
  const [editing, setEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(title)
  const [newContent, setNewContent] = useState(content)

  const onEditButtonClick = () => {
    if (editing) {
      const editingDiv = document.getElementById(id)
      setNewTitle(editingDiv.children[0].value)
      setNewContent(editingDiv.children[1].value)
      onSectionSave({ [title]: [editingDiv.children[0].value, editingDiv.children[1].value] })
    }
    setEditing(!editing)
  }

  const onDeleteButtonClick = () => {
    onSectionDelete({ [title]: [title, content] })
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          className="px-4 mr-2 mt-2 bg-spearmint hover:bg-spearmint-dark rounded border border-2 text-white"
          onClick={onEditButtonClick}
        >
          {editing ? 'Save' : 'Edit'}
        </button>

        <button
          className="mr-2 mt-2 border bg-red-300 hover:bg-red-400 rounded border-2 px-4 text-white"
          onClick={onDeleteButtonClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
      {editing ? <EditingSection id={id} title={newTitle} content={newContent}/> : <MarkdownSection title={newTitle} content={newContent} />}
    </div>
  )
}
