"use client";

import { useState, useEffect, MouseEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";

import { AddIcon, DeleteIcon, EditIcon, RefreshIcon } from "@/components/Icons";
import { NotesSection } from "@/components/NotesSection";
import { EditableNotesSection } from "@/components/EditableNotesSection";
import { ModalAddNotes, ModalDeleteConfirmation } from "@/components/Modals";
import { useToast } from '@/providers/Toast';
import { ToastBox } from '@/components/Toast';


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
  { note, currentFilename, filenames }: NotesData
) {
  const { data: session, status, update } = useSession();
  void status;

  const [editMode, setEditMode] = useState(false);
  const [addNotesModal, setAddNotesModal] = useState(false);
  const [deleteNotesModal, setDeleteNotesModal] = useState(false);
  const [notesData, setNotesData] = useState<NotesData>({
    note,
    currentFilename,
    filenames
  });

  const { updateToasts } = useToast();

  useEffect(() => {
    sessionStorage.clear();
    sessionStorage.setItem('note_for_' + currentFilename, JSON.stringify(note));
  }, [currentFilename, note]);

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

  function handleFileNameChange(e: ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    getNotesWithFilename(e.currentTarget.value);
  }

  function handleEditModeChange(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setEditMode(!editMode);
  }

  function handleRefreshCache(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    refreshCache();
  }

  async function getNotesWithFilename(filename: string) {

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

    const makeRequest = async (token: string) => {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: filename })
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/get_with_filename`, requestOptions);
      return response
    }

    try {
      let response = await makeRequest(session.access_token)
      if (response.status === 401) {
        const newSession = await update();
        if (!newSession?.access_token) {
          throw new Error('Failed to refresh token');
        }
        response = await makeRequest(newSession.access_token)
      }
      if (response.ok) {
        const data = await response.json()
        const note: Note = data.note
        sessionStorage.setItem('note_for_' + filename, JSON.stringify(note));

        if (notesData.filenames.includes(filename)) {
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
        // updateToasts(successMessage, true)
      } else if (response.status === 401) {
        throw new Error("Failed after token refresh! You need to refresh the page.")
      } else {
        throw new Error("There was an error, please try again later!")
      }
    } catch (error) {
      const errorString = error instanceof Error ? error.message : String(error);
      updateToasts(errorString, false)
    }
  }

  async function refreshCache() {
    if (!session) return;

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
        note: { title: "", content: "" },
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

  async function deleteNote() {
    if (!session) return;

    setDeleteNotesModal(false);
    const makeRequest = async (token: string, filename: string) => {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: filename })
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/delete`, requestOptions);
      return response
    }

    try {
      let response = await makeRequest(session.access_token, notesData.currentFilename);
      if (response.status === 401) {
        const newSession = await update();
        if (!newSession?.access_token) {
          throw new Error('Failed to refresh token');
        }
        response = await makeRequest(newSession.access_token, notesData.currentFilename)
      }
      if (response.ok) {
        if (notesData.filenames.length == 1) {
          setNotesData({
            note: { title: "", content: "" },
            currentFilename: "",
            filenames: []
          });
        } else {
          refreshCache();
        }
        updateToasts("Note " + notesData.currentFilename + " deleted", true)
      } else if (response.status === 401) {
        throw new Error("Failed after token refresh! You must refresh the page!")
      } else {
        throw new Error("Error deleting note, try again later")
      }
    } catch (error) {
      const errorString = error instanceof Error ? error.message : String(error);
      updateToasts(errorString, false)

    }
  }


  async function addNote(newFilename: string) {
    if (!session) return;

    setAddNotesModal(false)

    const makeRequest = async (token: string, filename: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notes/add`, {
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: filename })
      })
      return response
    }
    try {
      let response = await makeRequest(session.access_token, newFilename);
      if (response.status === 401) {
        const newSession = await update();
        if (!newSession?.access_token) {
          throw new Error('Failed to refresh token');
        }
        response = await makeRequest(newSession.access_token, newFilename)
      }
      newFilename = newFilename.replace(/\s/g, '_').toLowerCase()
      if (response.ok) {
        updateToasts("Note " + newFilename + " added", true)
        await getNotesWithFilename(newFilename)
      } else if (response.status === 401) {
        throw new Error("Failed after token refresh! You must refresh the page!")
      } else {
        throw new Error("Error adding note, try again later")
      }
    } catch (error) {
      const errorString = error instanceof Error ? error.message : String(error);
      updateToasts(errorString, false)
    }
  }

  async function updateNotesContent(title: string, newContent: string) {
    if (!session) return;
    const newNote: Note = {
      title: title,
      content: newContent
    }
    const makeRequest = async (token: string) => {

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes_class: notesData.currentFilename, new_notes: newNote })
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notes/update`, requestOptions
      )
      return response

    }

    try {
      let response = await makeRequest(session.access_token)
      if (response.status === 401) {
        const newSession = await update();
        if (!newSession?.access_token) {
          throw new Error('Failed to refresh token');
        }
        response = await makeRequest(session.access_token)
      }
      if (response.ok) {
        updateToasts("Notes for " + title + " updated", true)
        setNotesData({
          ...notesData,
          note: newNote
        })
        setEditMode(false)
      } else if (response.status === 401) {
        throw new Error("Failed after token refresh! You must refresh the page!")
      } else {
        throw new Error("Error updating note, try again later")
      }
    } catch (error) {
      const errorString = error instanceof Error ? error.message : String(error);
      updateToasts(errorString, false)
      setEditMode(false)
    }
  }

  const buttonTailwind = "inline-flex h-10 w-1/12 justify-center items-center px-4 mx-1 text-black bg-tangerine-light shadow shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] rounded disabled:opacity-50 hover:bg-tangerine hover:border hover:border-tangerine-dark active:shadow-none active:translate-y-[0.5px]"

  return (
    <>
      <div className="flex flex-col items-center m-2">
        <ToastBox />
      </div>
      <ModalAddNotes open={addNotesModal} onClose={closeModal} onSave={(title) => addNote(title)} />
      <ModalDeleteConfirmation open={deleteNotesModal} title={notesData.currentFilename} onClose={closeModal} onDelete={deleteNote} />
      <div className="flex flex-col items-center">
        <form className="flex flex-row w-full px-8 justify-center md:items-center md:px-12 md:h-12">
          {notesData.filenames.length > 0 ?
            <select className="border border-gray text-sm bg-gray rounded shadow-lg block focus:border-skyblue w-3/6 md:w-1/6 h-10" onChange={handleFileNameChange}>
              <option key={notesData.currentFilename} value={notesData.currentFilename}>{notesData.currentFilename}</option>
              {notesData.filenames.map((filename) => (
                (filename !== notesData.currentFilename) && (<option key={filename} value={filename}>{filename}</option>)
              ))}
            </select>
            : null
          }
          <button className={buttonTailwind} onClick={handleRefreshCache}>
            <RefreshIcon width="16" height="16" />
          </button>
          {
            !editMode && notesData.filenames.length > 0 ?
              <button className={buttonTailwind} onClick={handleEditModeChange}>
                <EditIcon width="16" height="16" />
              </button> :
              <button
                disabled
                className="bg-gray-400 rounded shadow-lg text-white p-1 mx-1"
              >
                <EditIcon width="16" height="16" />
              </button>
          }
          <button className={buttonTailwind} onClick={openAddNotesModal}>
            <AddIcon width="16" height="16" />
          </button>
          <button className={buttonTailwind} onClick={openDeleteNotesModal}>
            <DeleteIcon width="16" height="16" />
          </button>
        </form>
        {notesData.filenames.length === 0 || !notesData.note ? (
          <p className="text-black">
            No notes found. Click &apos;+&apos; to get started! (Click &apos;refresh&apos; if you think this is in error)
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
