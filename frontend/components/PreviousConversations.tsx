import { useRef, useState, useEffect, CSSProperties } from "react";
import { DeleteIcon } from '@/components/Icons';
import { FixedSizeList as List } from 'react-window';
import { ListChildComponentProps } from 'react-window';


export interface PrevConversation {
  title: string;
  conversation_id: string;
}

interface PreviousConversationsMenuProps {
  prevConversations: PrevConversation[];
  onConversationSelect: (id: string, title: string) => void;
  onConversationDelete: (id: string) => void;
}

export function PreviousConversationsMenu(
  { prevConversations, onConversationSelect, onConversationDelete }: PreviousConversationsMenuProps
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

  const scrollbarHideStyle: CSSProperties = {
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }

  const itemSize = 80;
  const maxHeight = window.innerHeight * 0.8;


  return (
    <>
      <div
        ref={windowRef}
        className={`fixed h-screen w-64 bg-tangerine shadow-lg z-50 transform transition-transform duration-75 ease-in-out ${open ? '-translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col pt-4 h-screen pb-16">
          <h2 className="text-xl font-bold mb-4 text-black border-b-8 border-grey pb-2 pl-4 flex-shrink-0">Previous Conversations</h2>
          <div className="flex-1">
            <ul className="space-y-2 px-4">
              <List
                height={Math.min(prevConversations.length * itemSize, maxHeight)}
                width="100%"
                itemCount={prevConversations.length}
                itemSize={itemSize}
                style={scrollbarHideStyle}
              >
                {({ index, style }: ListChildComponentProps) => {
                  return (
                    <li key={index} className="pb-1 border-b" style={style}>
                      <div className="flex group">
                        <button onClick={() => loadConversation(prevConversations[index].conversation_id, prevConversations[index].title)} className="hover:bg-tangerine-dark rounded p-1 mx-2 text-left flex-grow">
                          <p className="text-black text-md"> {prevConversations[index].title.substring(0, 40)}...</p>
                        </button>
                        <button
                          onClick={() => deleteConversation(prevConversations[index].conversation_id)}
                          className="relative inline-flex items-center h-8 mt-1 cursor-pointer border-0 bg-transparent p-1 before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-red-400 before:shadow hover:before:border-red-400 hover:before:bg-red-500 hover:before:border active:border-t-2 active:border-transparent active:py-1 active:before:shadow-none"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </li>
                  )
                }}
              </List>
            </ul>
          </div>
        </div>
      </div >
      <button
        className={`fixed ml-2 top-1/2 transform -translate-y-1/2 text-black rounded-full opacity-50 hover:opacity-100 bg-tangerine px-3 py-1 shadow-lg transition-all duration-300 ease-in-out  ${open ? 'left-64' : 'left-1'}`}
        onClick={() => setOpen(!open)}
      >
        {open ? "<" : ">"}
      </button>
    </>
  )
}
