"use client";
import Markdown from 'react-markdown'
import { useState, useEffect } from 'react'

export default function Notes() {

  const [notes, setNotes] = useState("")


  useEffect(() => {
    console.log("useEffect")
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
      console.log(data)
    }
    getNotes()
  }, [])



  return (
    <div>
      {notes}
    </div>
  )
}
