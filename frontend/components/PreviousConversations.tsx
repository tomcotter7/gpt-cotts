import { useRef, useState, useEffect } from "react";
import { DeleteIcon } from '@/components/Icons';

export interface PrevConversation {
    title: string;
    id: string;
}

interface PreviousConversationsMenuProps {
    prevConversations: PrevConversation[];
    onConversationSelect: (id: string, title: string) => void;
    onConversationDelete: (id: string) => void;
    onConversationRename: (id: string, title: string) => void;
}

export function PreviousConversationsMenu(
    {prevConversations, onConversationSelect, onConversationDelete, onConversationRename}: PreviousConversationsMenuProps
) {
    const [open, setOpen] = useState(false);
    const windowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (windowRef.current && !windowRef.current.contains(event.target as Node) && open) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "p" && event.altKey) {
                setOpen(!open);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);
    
    function loadConversation(id: string, title: string) {
        setOpen(false);
        onConversationSelect(id, title);
    }

    function deleteConversation(id: string) {
        onConversationDelete(id);
    }

    return (
        <>
         <div 
            ref={windowRef}
            className={`fixed h-full w-64 bg-tangerine shadow-lg z-50 transform transition-transform duration-75 ease-in-out ${
              open ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-black border-b-8 border-grey pb-2">Previous Conversations</h2>
              <ul className="space-y-2">
                {prevConversations.map((conversation, idx) => (
                  <li key={idx} className="pb-1 border-b">
                    <div className="flex group">
                        <button onClick={() => loadConversation(conversation.id, conversation.title)} className="hover:bg-tangerine-dark rounded p-1 mx-2 text-left flex-grow">
                            <p className="text-black text-md"> {conversation.title} </p>
                        </button>
                        <button onClick={() => deleteConversation(conversation.id)} className="bg-red-400 group-hover:opacity-100 h-full rounded p-1 opacity-0">
                            <DeleteIcon />
                        </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
        </div>
        <button
            className={`fixed ml-2 top-1/2 transform -translate-y-1/2 text-black rounded-full bg-tangerine px-3 py-1 shadow-lg transition-all duration-300 ease-in-out  ${open ? 'left-64' : 'left-1' }`}
            onClick={() => setOpen(!open)}
        >
            {open ? "<" : ">" }
        </button>
        </>
    )
}
