"use client";
import Markdown from 'react-markdown'
import { useState, useEffect } from 'react'

function Section({ title, content, size }) {
  if (typeof content === 'string') {
    const oldSize = size * 1.5
    return (
      <>
        <h1 style={{ "fontSize": oldSize+"em" }}><b> {title} </b></h1>
        <Markdown>
          {content}
        </Markdown>
      </>
    )
  } else {

    return (
      <>
        <h1 style={{ "fontSize": size*1.5+"em" }}><b> {title} </b></h1>
        {Object.entries(content).map(([key, value]) => (
          <div key={Date.now() + key}>
            <Section key={key} title={key} content={value} size={size / 1.5} />
          </div>
        ))}
      </>
    )
  }
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
    <div className="mt-2">
      <h1 className="text-center text-4xl">Notes</h1>
      <div className="flex flex-col items-center space-y-2">
        {Object.entries(notes).map(([key, value]) => (
          <div key={Date.now() + key} className="border w-3/4 rounded border-2">
            <Section key={key} title={key} content={value} size={2} />
          </div>
        ))}
      </div>
    </div>
  )
}
