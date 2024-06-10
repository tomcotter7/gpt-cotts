"use client";
import 'katex/dist/katex.min.css'
import { useState, useEffect, useRef } from 'react'
import { Section } from '@/components/NotesSection'
import { ToastBox } from '@/components/Toast'
import axios from 'axios'

export default function Notes() {

    const [notes, setNotes] = useState({})
    const [currentFilename, setCurrentFilename] = useState("select a file")
    const [filenames, setFilenames] = useState([])
    const [toasts, setToasts] = useState({})

  useEffect(() => {
    const getNotes = async (token) => {
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + token
        }})

        const data = await response.json()
        const sections = data.sections
        const filenames = data.filenames

        const sortedKeys = Object.keys(sections).sort()
        const sortedData = {}
        sortedKeys.forEach(key => {
            sortedData[key] = sections[key]
        })

        sessionStorage.setItem('notes_for_' + filenames[0], JSON.stringify(sortedData))

        setNotes(sortedData)
        setFilenames(filenames)
        setCurrentFilename(filenames[0])

    }

    const token = localStorage.getItem('authToken')

    if (!token) {
        window.location.href = "/"
    }
    getNotes(token)
  }, [])

    useEffect(() => {
        const getNotes = async (token) => {
            const raw = JSON.stringify({filename: currentFilename})
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: raw
            };
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/get_with_filename`, requestOptions)
                .then(
                    (res) => {
                        if (res.ok) {
                            return res.json()
                        } else if (res.status === 401) {
                            setToast({...toasts, [Data.now()]: {message: "Your session has expired. Please log in again.", success: false}})
                            localStorage.removeItem('authToken')
                            window.location.href = "/"
                        }})
                .then((data) => {
                    const sections = data.sections
                    const sortedKeys = Object.keys(sections).sort()
                    const sortedData = {}
                    sortedKeys.forEach(key => {
                        sortedData[key] = sections[key]
                    })
                    sessionStorage.setItem('notes_for_' + currentFilename, JSON.stringify(sortedData))
                    setNotes(sortedData)
                })
            }

        if (currentFilename === "select a file") {
            return
        }
        const notes = sessionStorage.getItem('notes_for_' + currentFilename)
        if (notes) {
            setNotes(JSON.parse(notes))
        } else {
            const token = localStorage.getItem('authToken')
            if (!token) {
                window.location.href = "/"
            }
            getNotes(token)
        }

    }, [currentFilename])
 
  async function saveNotes(
      newNotes, 
      oldSectionName,
      newSectionName,
      successfulMessage,
      failureMessage
  ) {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              new_notes: newNotes,
              old_section_name: oldSectionName,
              new_section_name: newSectionName
          })
      })


      if (response.ok) {
        setToasts({...toasts, [Date.now()]: {message: successfulMessage, success: true}})
        setNotes(newNotes)
      } else {
        setToasts({...toasts, [Date.now()]: {message: failureMessage, success: false}})  
      }
  }

    const handleFileNameChange = (e) => {
        setCurrentFilename(e.target.value)
    }


  const onSectionSave = (updatedSection) => {
    var newNotes = { ...notes }
    const oldTitle = Object.keys(updatedSection)[0]
    const newTitle = Object.values(updatedSection)[0][0]
    const newContent = Object.values(updatedSection)[0][1]
    if (oldTitle !== newTitle) {
      delete newNotes[oldTitle]
    }

    newNotes[newTitle] = newContent
    
    const sortedKeys = Object.keys(newNotes).sort()
    const sortedData = {}
    sortedKeys.forEach(key => {
      sortedData[key] = newNotes[key]
    })
    saveNotes(sortedData, oldTitle, newTitle,  "Section saved successfully", "Section failed to save. Try again later.")
  }

  return (
    <>
      <div className="m-2 flex flex-col items-center">
        <ToastBox toasts={toasts} setToasts={setToasts}/>
        <h1 className="text-center text-4xl mb-2"><u>Notes</u></h1>
      </div>
      <div className="flex flex-col items-center">
        <form className="mb-2">
        <select className="bg-gray border border-gray text-sm rounded focus:border-skyblue block w-full" onChange={handleFileNameChange}>
                <option defaultValue key={currentFilename} value={currentFilename}>{currentFilename}</option>
                {filenames.map((filename) => (
                    (filename !== currentFilename) && (<option key={filename} value={filename}>{filename}</option>)
                ))}
            </select>
        </form>
        {Object.entries(notes).map(([key, value]) => (
          <div key={Date.now() + key} className="border w-full text-center prose max-w-none">
            <Section key={key} id={key} title={key} content={value} onSectionSave={(updatedSection) => onSectionSave(updatedSection)}/>
          </div>
        ))}
      </div>
    </>
  )
}
