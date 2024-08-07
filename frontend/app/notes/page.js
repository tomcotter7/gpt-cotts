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
            const headers = new Headers();
            headers.append('Authorization', 'Bearer ' + token)

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notes/get`,
                {
                    method: 'GET',
                    headers: headers,
                    redirect: 'follow'
                }
            )

            if (response.status === 401) {
                setToasts({...toasts, [Date.now()]: {message: "Your session has expired. Please log in again.", success: false}})
                localStorage.removeItem('authToken')
                window.location.href = "/auth"
            }

            const data = await response.json()
            const sections = data.sections
            const filenames = data.filenames

            sessionStorage.setItem(
                'notes_for_' + filenames[0], JSON.stringify(sections)
            )

            setNotes(sections)
            setFilenames(filenames)
            setCurrentFilename(filenames[0])
        }

        const token = localStorage.getItem('authToken')

        if (!token) {
            window.location.href = "/auth"
        }
        getNotes(token)
    }, [])

    useEffect(() => {
        if (currentFilename === "select a file") {
            return
        }
        const notes = sessionStorage.getItem('notes_for_' + currentFilename)
        if (notes) {
            setNotes(JSON.parse(notes))
        } else {
            const token = localStorage.getItem('authToken')
            if (!token) {
                window.location.href = "/auth"
            }
            getNotesWithFilename(token)
        }
    }, [currentFilename])

    const getNotesWithFilename = async (token, successMessage = "") => {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/get_with_filename`, requestOptions)
            if (response.ok) {
                const data = await response.json()
                const sections = data.sections
                sessionStorage.setItem('notes_for_' + currentFilename, JSON.stringify(sections))
                setNotes(sections)
                if (successMessage != "") {
                    setToasts({...toasts, [Date.now()]: {message: successMessage, success: true}})
                }
            } else if (response.status === 401) {
                setToasts({...toasts, [Date.now()]: {message: "Your session has expired. Please log in again.", success: false}})
                localStorage.removeItem('authToken')
                window.location.href = "/auth"
            }
    }


    const handleFileNameChange = (e) => {
        setCurrentFilename(e.target.value)
    }

    const refreshCache = () => {
        sessionStorage.removeItem('notes_for_' + currentFilename)
        getNotesWithFilename(localStorage.getItem('authToken'), "Cache refreshed.")
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

        <button className="bg-spearmint hover:bg-spearmint-dark rounded border border-2 text-white p-2 m-1" onClick={refreshCache}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 27 24"
                fill="none"
                stroke="black"
                strokeWidth={1.5}
                className="w-6 h-6"
            >
                <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
            </svg>
        </button>
        {Object.entries(notes).map(([key, value]) => (
          <div key={Date.now() + key} className="border w-full text-center prose max-w-none">
            <Section key={key} id={key} title={key} content={value} />
          </div>
        ))}
      </div>
    </>
  )
}
