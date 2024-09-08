"use client"
import { SaveIcon, CancelIcon } from '@/components/Icons'
import { useState, useRef, useEffect } from 'react'

const autosize = (element) => {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
}

export default function EditableNotesSection({id, title, content, onSave, onCancel}) {
    
    const textAreaRef = useRef(null)
    const [notes, setNotes] = useState(content)

    useEffect(() => {
        if (textAreaRef.current) {
            autosize(textAreaRef.current)
        }
    }, [notes]);

    const handleSave = async () => {
        await onSave(title, notes)
    }

    const handleCancel = () => {
        onCancel()
    }

    return (
        <div className="border border-black rounded max-w-full md:min-w-full text-center p-1">
            <h2 className="text-2xl text-skyblue">{title}</h2>
            <button
                className="bg-tangerine hover:bg-tangerine-dark p-1 mb-2 text-black rounded mr-2"
                onClick={handleSave}
            >
                <SaveIcon />
            </button>
            <button 
                className="bg-tangerine hover:bg-tangerine-dark p-1 mb-2 text-black rounded"
                onClick={handleCancel}
            >
                <CancelIcon />
            </button>
            <textarea
                ref={textAreaRef}
                id={id}
                className="w-full text-black rounded p-1"
                value={notes}
                onChange={(e) => {
                    setNotes(e.target.value);
                    autosize(e.target);
                }}
            />
        </div>
    )
}

