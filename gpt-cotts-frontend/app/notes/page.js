"use client";
import 'katex/dist/katex.min.css'
import { useState, useEffect, useRef } from 'react'
import { Section } from '@/components/NotesSection'
import { ToastBox } from '@/components/Toast'
import ModalSectionForm from '@/components/ModalSectionForm';


export default function Notes() {

  const [notes, setNotes] = useState({})
  const [toasts, setToasts] = useState({})
  const [modalOpen, setModalOpen] = useState(false)

  const handleModalClose = () => setModalOpen(false)
  
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
      console.log(sortedData)
      setNotes(sortedData)
    }
    getNotes()
  }, [])
 
  async function saveNotes(newNotes, successfulMessage, failureMessage) {
      fetch('http://localhost:8000/notes/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(newNotes)
      }).then(response => response.json())
      .then(response => {
        if (response === "success") {
          setToasts({...toasts, [Date.now()]: {message: successfulMessage, success: true}})
          setNotes(newNotes)
        } else {
          setToasts({...toasts, [Date.now()]: {message: failureMessage, success: false}})  
        }
      })
  }

  function onAddNewSectionClick() {
    setModalOpen(true)
  }

  function onNewSectionSave(e) {
    e.preventDefault()
    setModalOpen(false)
    const newNotes = {...notes, [e.target.title.value]: e.target.content.value}
    saveNotes(newNotes, "Section added successfully", "Section failed to add. Try again later.")
  }

  function onSectionDelete(sectionToDelete) {
    const newNotes = {...notes}
    const titleToDelete = Object.keys(sectionToDelete)[0]
    delete newNotes[titleToDelete]
    saveNotes(newNotes, "Section deleted successfully", "Section failed to delete. Try again later.")
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
    saveNotes(sortedData, "Section saved successfully", "Section failed to save. Try again later.")
  }

  return (
    <>
      <div className="m-2 flex flex-col items-center">
        <ModalSectionForm open={modalOpen} onClose={handleModalClose} onSave={onNewSectionSave}/>
        <ToastBox toasts={toasts} setToasts={setToasts}/>
        <h1 className="text-center text-4xl mb-2"><u>Notes</u></h1>
        <button 
          className="px-4 bg-purple-600 hover:bg-purple-500 rounded border border-purple-600 border-2 text-black"
          onClick={onAddNewSectionClick}
        >
        <b>Add new section</b>
      </button>
      </div>
      <div className="flex flex-col border items-center">
        {Object.entries(notes).map(([key, value]) => (
          <div key={Date.now() + key} className="border w-full text-center prose max-w-none">
            <Section key={key} id={key} title={key} content={value} onSectionSave={(updatedSection) => onSectionSave(updatedSection)} onSectionDelete={(sectionToDelete) => onSectionDelete(sectionToDelete)}/>
          </div>
        ))}
      </div>
    </>
  )
}
