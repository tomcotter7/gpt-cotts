"use client"

import { SaveIcon, CancelIcon } from "@/components/Icons";
import { useState, useRef, useEffect } from "react";

interface EditableNotesSectionProps {
    title: string,
    content: string,
    save: (title: string, content: string) => void,
    cancel: () => void
}

export function EditableNotesSection({ title, content, save, cancel }: EditableNotesSectionProps) {

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [contentValue, setContentValue] = useState(content);
    const [titleValue, setTitleValue] = useState(title);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
        }
    }, [contentValue]);

    function handleSave() {
        save(titleValue, contentValue);
    }

    function handleCancel() {
        cancel();
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
                id="content"
                className="w-full text-black rounded p-1"
                value={contentValue}
                onChange={(e) => {
                    setContentValue(e.target.value);
                }}
            />
        </div>
        )
}

