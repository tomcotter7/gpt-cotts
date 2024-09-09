"use client"

import 'katex/dist/katex.min.css'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Section } from '@/components/NotesSection'
import EditableNotesSection from '@/components/EditableNotesSection'
import { EditIcon, RefreshIcon, AddIcon, DeleteIcon } from '@/components/Icons'
import { ModalAddNotes, ModalDeleteConfirmation } from '@/components/Modals'
import { ToastBox } from '@/components/Toast'

export function NotesContent(
    { initialNotes, initialCurrentFilename, initialFilenames }
) {
    
    const [editMode, setEditMode] = useState(false)
    const [notes, setNotes] = useState(initialNotes)
    const [currentFilename, setCurrentFilename] = useState(initialCurrentFilename)
    const [filenames, setFilenames] = useState(initialFilenames)
    const [toasts, setToasts] = useState({})
    const [addNotesModal, setAddNotesModal] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)

    const openNotesModal = (e) => {e.preventDefault(); setAddNotesModal(true)}
    const openDeleteModal = (e) => {e.preventDefault(); setDeleteModal(true)}
    const closeModal = () => { setAddNotesModal(false); setDeleteModal(false) }



    useEffect(() => {
        sessionStorage.clear()
        sessionStorage.setItem('notes_for_' + currentFilename, JSON.stringify(notes))
    }, [])

    const { data: session, status } = useSession()

    const updateToasts = (message, success) => {
        setToasts({
            ...toasts,
            [Date.now()]: { message: message, success: success }
        })
    }

    const getNotesWithFilename = async (success_message = "") => {
        if (!session || filenames.length === 0 || currentFilename === "") {
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + session.access_token
            },
            body: JSON.stringify({ filename: currentFilename }),
        };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notes/get_with_filename`, requestOptions
        )
        if (response.ok) {
            const data = await response.json()
            const sections = data.sections
            sessionStorage.setItem(
                'notes_for_' + currentFilename, JSON.stringify(sections)
            )
            setNotes(sections)
            if (success_message != "") { updateToasts(success_message, true); }
        } else if (response.status === 401) {
            updateToasts("Your session has expired. Please log in again.", false)
            window.location.href = "/api/auth/signout/google"
        } else {
            updateToasts("Error getting notes", false)
        }
    }

    useEffect(() => {
        const cached_notes = sessionStorage.getItem('notes_for_' + currentFilename)
        if (cached_notes) {
            setNotes(JSON.parse(cached_notes))
        } else {
            getNotesWithFilename()
        }
    }, [currentFilename])

    const handleFileNameChange = (e) => {
        setCurrentFilename(e.target.value)
    }

    const refreshCache = async (e) => {
        e.preventDefault()
        sessionStorage.clear()
        const request_options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + session.access_token
            }
        }
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notes/get`, request_options
        )
        const data = await response.json()
        const sections = data.sections
        const filenames = data.filenames

        if (filenames.length == 0) {
            setNotes({})
            setFilenames([])
            setCurrentFilename("")
        } else { 
            setNotes(sections)
            setFilenames(filenames)
            setCurrentFilename(filenames[0])
        }
    }

    const updateEditMode = (e) => {
        e.preventDefault()
        setEditMode(!editMode)
    }

    const deleteNote = async (e) => {
        setDeleteModal(false)
        e.preventDefault()
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notes/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + session.access_token
                },
                body: JSON.stringify({ filename: currentFilename })
            }
        )
        if (response.ok) {
            updateToasts("Note deleted", true)
            await refreshCache(e)
        } else if (response.status === 401) {
            updateToasts("Your session has expired. Please log in again.", false)
            window.location.href = "/api/auth/signout/google"
        } else {
            updateToasts("Error deleting note", false)
        }
    }

    const addNote = async (e) => {
        setAddNotesModal(false)
        e.preventDefault()
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notes/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + session.access_token
                },
                body: JSON.stringify({ filename: e.target[0].value })
            }
        )
        const newFilename = e.target[0].value.replace(/\s/g, '_')
        if (response.ok) {
            updateToasts("Note added", true)
            await refreshCache(e)
            if (filenames.length !== 0) {
                setCurrentFilename(newFilename)
            }
        } else if (response.status === 401) {
            updateToasts("Your session has expired. Please log in again.", false)
            window.location.href = "/api/auth/signout/google"
        } else {
            updateToasts("Error adding note", false)
        }
    }

    const updateNotesContent = async (title, newContent) => {
        const newNotes = {}
        newNotes[title] = newContent
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + session.access_token
            },
            body: JSON.stringify({ notes_class: currentFilename, new_notes: newNotes })
        };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notes/update`, requestOptions
        )

        if (response.ok) {
            updateToasts("Notes updated", true)
            setNotes(newNotes)
            setEditMode(false)
        } else if (response.status === 401) {
            updateToasts("Your session has expired. Please log in again.", false)
            window.location.href = "/api/auth/signout/google"
        } else {
            updateToasts("Error updating notes", false)
            onCancel()
        }
    }

    const buttonTailwind = "bg-tangerine hover:bg-tangerine-dark rounded shadow-lg text-black p-1 ml-1"

    return (
        <>
          <div className="m-2 flex flex-col items-center">
            <ToastBox toasts={toasts} setToasts={setToasts}/>
          </div>
            <ModalAddNotes open={addNotesModal} onClose={closeModal} onSave={addNote}/>
            <ModalDeleteConfirmation open={deleteModal} title={currentFilename} onClose={closeModal} onDelete={deleteNote} />
          <div className="flex flex-col items-center">
            <form className="flex flex-row m-2">
                { filenames.length > 0 ?
                    <select className="border border-gray text-sm bg-gray rounded shadow-lg focus:border-skyblue block w-full h-6" onChange={handleFileNameChange}>
                        <option defaultValue key={currentFilename} value={currentFilename}>{currentFilename}</option>
                        {filenames.map((filename) => (
                            (filename !== currentFilename) && (<option key={filename} value={filename}>{filename}</option>)
                        ))}
                    </select>
                    : null
                }
                <button className={buttonTailwind} onClick={refreshCache}>
                    <RefreshIcon />
                </button>
                { 
                    !editMode && filenames.length > 0 ? 
                        <button
                            className={buttonTailwind}
                            onClick={updateEditMode}>
                            <EditIcon />
                        </button> :
                        <button
                            disabled
                            className="bg-gray-400 rounded shadow-lg text-white p-1 mx-1"
                        >
                            <EditIcon />
                        </button>
                }
                <button className={buttonTailwind} onClick={openNotesModal}>
                    <AddIcon />
                </button>
                <button className={buttonTailwind} onClick={openDeleteModal}>
                    <DeleteIcon />
                </button>
            </form>
            { filenames.length === 0  ? (
                <p className="text-black">
                    No notes found. Click '+' to get started! (Click 'refresh' if you think this is in error)
                </p> 
            ) : (
                editMode ? (
                    <EditableNotesSection
                        id={currentFilename}
                        title={Object.keys(notes)[0]}
                        content={notes[Object.keys(notes)[0]]}
                        onSave={updateNotesContent}
                        onCancel={() => setEditMode(false)}
                    /> 
                ) : (
                    <Section
                        id={currentFilename}
                        title={Object.keys(notes)[0]}
                        content={notes[Object.keys(notes)[0]]}
                    />
                )
            )}
          </div>
        </>
    )
}
