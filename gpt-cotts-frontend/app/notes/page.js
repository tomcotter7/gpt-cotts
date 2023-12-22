"use client";
import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useState, useEffect } from 'react'

function Section({ title, content }) {
  
  const [editing, setEditing] = useState(false)

  return (
    <div>
      <div className="flex justify-end">
        <button
          className="px-4 mr-2 mt-2 bg-fuchsia-500 hover:bg-fuchsia-400 rounded border border-2 text-white"
          onClick={() => setEditing(!editing)}
        >
          edit
        </button>
      </div>
      <h1 className="text-fuchsia-500 text-center"><b> {title} </b></h1>
      <Markdown remarkPlugins={remarkMath} rehypePlugins={rehypeKatex}>
          {content}
      </Markdown>
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
      console.log(data)
    }
    getNotes()
  }, [])

  return (
    <div className="m-2">
      <h1 className="text-center text-4xl">Notes</h1>
      <div className="flex flex-col border items-center">
        {Object.entries(notes).map(([key, value]) => (
          <div key={Date.now() + key} className="border w-full text-center prose max-w-none">
            <Section key={key} title={key} content={value} />
          </div>
        ))}
      </div>
    </div>
  )
}
