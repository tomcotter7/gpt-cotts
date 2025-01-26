import React from 'react';
import Modal from '@mui/material/Modal';
import { CancelIcon, SaveIcon, DeleteIcon } from '@/components/Icons';

const wrapperStyle: string = "flex flex-col items-center justify-center h-3/6"
const coreDivStyle: string = "bg-skyblue border border-black p-4 w-5/6 rounded-md shadow-md"

interface ModalAddNotesProps {
  open: boolean;
  onClose: () => void;
  onSave: (newFilename: string) => void;
}

const buttonTailwind = "relative inline-flex h-8 w-1/12 justify-center items-center px-4 mx-1 text-black rounded bg-tangerine-light shadow shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:bg-tangerine hover:border hover:border-tangerine-dark active:border-t-4 active:border-transparent active:py-3 active:shadow-none"

export function ModalAddNotes({ open, onClose, onSave }: ModalAddNotesProps) {

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      title: { value: string };
    };
    onSave(target.title.value);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className={wrapperStyle}>
        <div className={coreDivStyle}>
          <h2 className="text-2xl text-black text-center">Add a Note</h2>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label className="text-lg text-black font-semibold mb-2">Note Title</label>
            <input className="border rounded-md p-2 mb-4 text-black" type="text" name="title" />
            <div className="flex flex-row justify-end items-end">
              <button className={buttonTailwind} onClick={onClose}><CancelIcon /></button>
              <button className={buttonTailwind} type="submit"><SaveIcon /></button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}

interface ModalDeleteNotesProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onDelete: () => void;
}

export function ModalDeleteConfirmation({ open, title, onClose, onDelete }: ModalDeleteNotesProps) {

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    onDelete();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className={wrapperStyle}>
        <div className={coreDivStyle}>
          <p className="text-2xl text-black text-center">Delete {title}?</p>
          <div className="flex flex-row justify-end items-end">
            <button className={buttonTailwind} onClick={onClose}><CancelIcon /></button>
            <button className={buttonTailwind} onClick={handleDelete}><DeleteIcon /></button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
