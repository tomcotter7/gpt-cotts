"use client";

import { useState, useEffect, MouseEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";

import { AddIcon, DeleteIcon, EditIcon, RefreshIcon } from "@/components/Icons";
import { NotesSection } from "@/components/NotesSection";
import { EditableNotesSection } from "@/components/EditableNotesSection";
import { ModalAddNotes, ModalDeleteConfirmation } from "@/components/Modals";
import { updateToasts, ToastBox } from "@/components/Toast";


export interface Note {
    title: string,
    content: string
}

interface NotesData {
    note: Note,
    currentFilename: string,
    filenames: string[],
    
}


export function NotesContent(
    { note, currentFilename, filenames}: NotesData
) {
    const { data: session, status } = useSession();
    
    const [editMode, setEditMode] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [addNotesModal, setAddNotesModal] = useState(false);
    const [deleteNotesModal, setDeleteNotesModal] = useState(false);
    const [notesData, setNotesData] = useState<NotesData>({
        note,
        currentFilename,
        filenames 
    });

    function openAddNotesModal(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setAddNotesModal(true);
    }

    function openDeleteNotesModal(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setDeleteNotesModal(true);
    }

    function closeModal() {
        setAddNotesModal(false);
        setDeleteNotesModal(false);
    }

    useEffect(() => {
        sessionStorage.clear();
        sessionStorage.setItem('note_for_' + notesData.currentFilename, JSON.stringify(notesData.note));
    }, []);

    function handleFileNameChange(e: ChangeEvent<HTMLSelectElement>) {
        e.preventDefault();
        getNotesWithFilename(e.currentTarget.value);
    }

    function handleEditModeChange(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setEditMode(!editMode);
    }

    async function getNotesWithFilename(filename: string, successMessage: string = "") {

        if (!session) {
            return;
        }

        const cached_notes = sessionStorage.getItem('note_for_' + filename);
        if (cached_notes) {
            setNotesData({
                    ...notesData,
                    currentFilename: filename,
                    note: JSON.parse(cached_notes)
                    });
            return
        }

        const requestOptions = {
method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
body: JSON.stringify({ filename: filename })
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/get_with_filename`, requestOptions);
        if (response.ok) {
            const data = await response.json()
            const note: Note = data.note
            sessionStorage.setItem('note_for_' + filename, JSON.stringify(note));

            if ( notesData.filenames.includes(filename)) {
                setNotesData({
                    ...notesData,
                    currentFilename: filename,
                    note: note
                });
            } else {
                setNotesData({
                    ...notesData,
                    currentFilename: filename,
                    note: note,
                    filenames: [...notesData.filenames, filename]
                });
            }
            if (successMessage !== "") { console.log(successMessage); }
        } else if (response.status == 401) {
            console.log("Session expired");
            window.location.href = '/api/auth/signout/google';
        } else {
            console.log("Error fetching notes");
        }
            
    }

    async function refreshCache(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        sessionStorage.clear();

        const request_options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/get`, request_options)
        const data = await response.json()
        const note: Note = data.note
        const filenames = data.filenames

        if (filenames.length == 0) {
            setNotesData({
                note: {title: "", content: ""},
                currentFilename: "",
                filenames: []
            });
        } else {
            setNotesData({
                note: note,
                currentFilename: filenames[0],
                filenames: filenames
            });
        }
    }

    async function deleteNote(e: MouseEvent<HTMLButtonElement>) {
        setDeleteNotesModal(false);
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ filename: notesData.currentFilename })
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/delete`, requestOptions);

        if (response.ok) {
            if (notesData.filenames.length == 1) {
                setNotesData({
                    note: {title: "", content: ""},
                    currentFilename: "",
                    filenames: []
                });
            } else {
                refreshCache(e);
            }
            updateToasts("Note " + notesData.currentFilename + " deleted", true, setToasts)
        } else if (response.status == 401) {
            updateToasts("Your session has expired. Please log in again.", false, setToasts)
            window.location.href = '/api/auth/signout/google';
        } else {
            updateToasts("Error deleting note", false, setToasts)
        }
    }

    
    async function addNote(e: MouseEvent<HTMLFormElement>) {
        e.preventDefault();


        const element: HTMLInputElement = e.currentTarget.elements.namedItem('title') as HTMLInputElement
        var newFilename = element.value

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
                body: JSON.stringify({ filename: newFilename })
            }
        )
        newFilename = newFilename.replace(/\s/g, '_').toLowerCase()
        if (response.ok) {
            updateToasts("Note " + newFilename + " added", true, setToasts)
            await getNotesWithFilename(newFilename)
        } else if (response.status === 401) {
            updateToasts("Your session has expired. Please log in again.", false, setToasts)
            window.location.href = "/api/auth/signout/google"
        } else {
            updateToasts("Error adding note", false, setToasts)
        }
    }

    async function updateNotesContent(title: string, newContent: string) {
        const newNote : Note = {
            title: title,
            content: newContent
        }
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + session.access_token
            },
            body: JSON.stringify({ notes_class: notesData.currentFilename, new_notes: newNote })
        };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notes/update`, requestOptions
        )

        if (response.ok) {
            updateToasts("Notes for " + title + " updated", true, setToasts)
            setNotesData({
                ...notesData,
                note: newNote
            })
            setEditMode(false)
        } else if (response.status === 401) {
            updateToasts("Your session has expired. Please log in again.", false, setToasts)
            window.location.href = "/api/auth/signout/google"
        } else {
            updateToasts("Error updating notes", false, setToasts)
            setEditMode(false)
        }
    }


    const buttonTailwind = "bg-tangerine hover:bg-tangerine-dark hover:border hover:border-tangerine rounded shadow-md text-black p-1 ml-1";

    return (
        <>  
            <div className="flex flex-col items-center m-2">
                <ToastBox toasts={toasts} setToasts={setToasts} />
            </div>
            <ModalAddNotes open={addNotesModal} onClose={closeModal} onSave={(title) => addNote(title)} />
            <ModalDeleteConfirmation open={deleteNotesModal} title={notesData.currentFilename} onClose={closeModal} onDelete={deleteNote} />
            <div className="flex flex-col items-center">
                <form className="flex flex-row m-2">
                    { notesData.filenames.length > 0 ?
                    <select className="border border-gray text-sm bg-gray rounded shadow-lg focus:border-skyblue block w-full h-6" onChange={handleFileNameChange}>
                        <option key={notesData.currentFilename} value={notesData.currentFilename}>{notesData.currentFilename}</option>
                        {notesData.filenames.map((filename) => (
                            (filename !== notesData.currentFilename) && (<option key={filename} value={filename}>{filename}</option>)
                        ))}
                    </select>
                    : null
                    }
                    <button className={buttonTailwind} onClick={refreshCache}>
                        <RefreshIcon />
                    </button>
                    {
                    !editMode && notesData.filenames.length > 0 ? 
                        <button className={buttonTailwind} onClick={handleEditModeChange}>
                            <EditIcon />
                        </button> :
                        <button
                            disabled
                            className="bg-gray-400 rounded shadow-lg text-white p-1 mx-1"
                        >
                            <EditIcon />
                        </button>
                    }
                    <button className={buttonTailwind} onClick={openAddNotesModal}>
                        <AddIcon />
                    </button>
                    <button className={buttonTailwind} onClick={openDeleteNotesModal}>
                        <DeleteIcon />
                    </button>
                </form>
                { notesData.filenames.length === 0 || !notesData.note  ? (
                    <p className="text-black">
                        No notes found. Click '+' to get started! (Click 'refresh' if you think this is in error)
                    </p> 
                ) : (
                    editMode ? (
                        <EditableNotesSection
                            title={notesData.note.title}
                            content={notesData.note.content}
                            save={updateNotesContent}
                            cancel={() => setEditMode(false)}
                        />
                    ) : (
                        <NotesSection
                            title={notesData.note.title}
                            content={notesData.note.content}
                        />
                    )
                )}

            </div>
        </>
    );
}
