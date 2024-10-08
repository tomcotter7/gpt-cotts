import Modal from '@mui/material/Modal'
import { CancelIcon, SaveIcon } from '@/components/Icons'

const wrapperStyle = "flex flex-col items-center justify-center h-3/6"
const coreDivStyle = "bg-skyblue border border-black p-4 w-5/6 rounded-md shadow-md"

export function ModalAddNotes({ open, onClose, onSave }) {

  return (
      <Modal open={open} onClose={onClose}>
      <div className={wrapperStyle}>
          <div className={coreDivStyle}>
            <h2 className="text-2xl text-black text-center">Add a Note</h2>
            <form className="flex flex-col" onSubmit={onSave}>
                <label className="text-lg text-black font-semibold mb-2">Note Title</label>
                <input className="border rounded-md p-2 mb-4 text-black" type="text" name="title" />
                <div className="flex flex-row justify-end items-end">
                    <button className="bg-tangerine p-2 ml-1 rounded hover:bg-tangerine-dark" onClick={onClose}><CancelIcon /></button>
                    <button className="bg-tangerine p-2 ml-1 rounded hover:bg-tangerine-dark" type="submit"><SaveIcon /></button>
                </div>
            </form>
          </div>
        </div>
      </Modal>
  )
}

export function ModalDeleteConfirmation({ open, title, onClose, onDelete }) {

    return (
        <Modal open={open} onClose={onClose}>
            <div className={wrapperStyle}>
                <div className={coreDivStyle}>
                    <p className="text-2xl text-black text-center">Delete {title}?</p>
                    <div className="flex flex-row justify-end items-end">
                        <button className="bg-tangerine p-2 ml-1 text-black rounded hover:bg-tangerine-dark" onClick={onClose}>Cancel</button>
                        <button className="bg-tangerine p-2 ml-1 text-black rounded hover:bg-tangerine-dark" onClick={onDelete}>Delete</button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
