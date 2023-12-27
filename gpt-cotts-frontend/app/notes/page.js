"use client";
import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useState, useEffect } from 'react'

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

function Section({ title, content, onSectionSave, id }) {
  
  const [editing, setEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(title)
  const [newContent, setNewContent] = useState(content)

  const onEditButtonClick = () => {
    if (editing) {
      const editingDiv = document.getElementById(id)
      setNewTitle(editingDiv.children[0].value)
      setNewContent(editingDiv.children[1].value)
      console.log(title)
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

export default function Notes() {

  const [notes, setNotes] = useState({})

  useEffect(() => {
    const getNotes = async () => {
      const response = await fetch('http://localhost:8000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({})
      })

      const data = await response.json()
      setNotes(data)
    }
    getNotes()
  }, [])

  const onSectionSave = (updatedSection) => {
    var newNotes = notes
    delete newNotes[Object.keys(updatedSection)[0]]
    newNotes[Object.values(updatedSection)[0][0]] = Object.values(updatedSection)[0][1]
    setNotes(newNotes)
  }

  return (
    <div className="m-2">
      <h1 className="text-center text-4xl">Notes</h1>
      <div className="flex flex-col border items-center">
        {Object.entries(notes).map(([key, value]) => (
          <div key={Date.now() + key} className="border w-full text-center prose max-w-none">
            <Section key={key} id={key} title={key} content={value} onSectionSave={(updatedSection) => onSectionSave(updatedSection)}/>
          </div>
        ))}
      </div>
    </div>
  )
}
