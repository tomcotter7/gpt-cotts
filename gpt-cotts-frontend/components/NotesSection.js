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
      <h1 className="text-fuchsia-500 text-center"><b> {title} </b></h1>
      <Markdown remarkPlugins={remarkMath} rehypePlugins={rehypeKatex}>
        {content}
      </Markdown>
    </div>
  )
}

export default function Section({ title, content, onSectionSave, id }) {
  
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

  return (
    <div>
      <div className="flex justify-end">
        <button
          className="px-4 mr-2 mt-2 bg-fuchsia-500 hover:bg-fuchsia-400 rounded border border-2 text-white"
          onClick={onEditButtonClick}
        >
        {editing ? 'Save' : 'Edit'}
        </button>
      </div>
      {editing ? <EditingSection id={id} title={newTitle} content={newContent}/> : <MarkdownSection title={newTitle} content={newContent} />}
    </div>
  )
}
