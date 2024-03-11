"use client";
import 'katex/dist/katex.min.css'
import { useState, useEffect, useRef } from 'react'
import { Section } from '@/components/NotesSection'
import { ToastBox } from '@/components/Toast'
import ModalSectionForm from '@/components/ModalSectionForm';
import axios from 'axios'


export default function Notes() {

  const [notes, setNotes] = useState({})
  const [toasts, setToasts] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
      setLoggedIn(localStorage.getItem('token') != null)
    }, [])

  const handleModalClose = () => setModalOpen(false)
  
  useEffect(() => {
    const getNotes = async () => {
      const token = localStorage.getItem('token')

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notes`)

      if (response.status === 401) {
        setLoggedIn(false)
        return
      }
      const data = await response.data.sections

      const sortedKeys = Object.keys(data).sort()
      const sortedData = {}
      sortedKeys.forEach(key => {
        sortedData[key] = data[key]
      })
      setNotes(sortedData)
    }
    getNotes()
  }, [])
 
  async function saveNotes(
      newNotes, 
      oldSectionName,
      newSectionName,
      successfulMessage,
      failureMessage
  ) {
      const token = localStorage.getItem('token')
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

  function onAddNewSectionClick() {
    setModalOpen(true)
  }

  function onNewSectionSave(e) {
    e.preventDefault()
    setModalOpen(false)
    const newNotes = {...notes, [e.target.title.value]: e.target.content.value}
    // saveNotes(newNotes, e.target.title.value, "Section added successfully", "Section failed to add. Try again later.")
  }

  function onSectionDelete(sectionToDelete) {
    const newNotes = {...notes}
    const titleToDelete = Object.keys(sectionToDelete)[0]
    delete newNotes[titleToDelete]
    // saveNotes(newNotes, sectionToDelete, "Section deleted successfully", "Section failed to delete. Try again later.")
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

  //if (!loggedIn) {
    // return <p>Not logged in</p>
    // return <NotLoggedIn/>
  //}

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
