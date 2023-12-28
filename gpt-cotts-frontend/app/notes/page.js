"use client";
import 'katex/dist/katex.min.css'
import { useState, useEffect, useRef } from 'react'
import { Section } from '@/components/NotesSection'



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
      const sortedKeys = Object.keys(data).sort()
      const sortedData = {}
      sortedKeys.forEach(key => {
        sortedData[key] = data[key]
      })
      setNotes(sortedData)
    }
    getNotes()
  }, [])
  
  function saveNotes(newNotes) {
      fetch('http://localhost:8000/notes/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(newNotes)
        }).then(response => console.log(response))
  }

  const onSectionSave = (updatedSection) => {
    var newNotes = { ...notes }
    const newTitle = Object.values(updatedSection)[0][0]
    const newContent = Object.values(updatedSection)[0][1]
    if (Object.keys(updatedSection)[0] !== newTitle) {
      delete newNotes[Object.keys(updatedSection)[0]]
      newNotes[Object.values(updatedSection)[0][0]] = Object.values(updatedSection)[0][1]
    } else {
      newNotes[newTitle] = newContent
    }
    
    const sortedKeys = Object.keys(newNotes).sort()
    const sortedData = {}
    sortedKeys.forEach(key => {
      sortedData[key] = newNotes[key]
    })
    setNotes(sortedData)
    saveNotes(sortedData)
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
