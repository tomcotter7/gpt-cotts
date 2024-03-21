import Modal from '@mui/material/Modal'

export default function ModalSectionForm({ open, onClose, onSave }) {

  return (
      <Modal open={open} onClose={onClose}>
        <div className="flex flex-col items-center justify-center mt-52 mx-24">

          <div className="bg-gray-400 p-4 w-full rounded-md shadow-md">
            <div className="flex">
              <button className="ml-auto bg-tangerine p-2 rounded hover:bg-spearmint" onClick={onClose}>Cancel</button>
            </div>
            <form className="flex flex-col" onSubmit={onSave}>
              <label className="text-lg text-black font-semibold mb-2"><u>Section Title</u></label>
              <input className="border rounded-md p-2 mb-4 text-black" type="text" name="title" />
              <label className="text-lg text-black font-semibold mb-2"><u>Section Content</u></label>
              <textarea className="border rounded-md p-2 text-black" style={{"height": "12vh"}} name="content" />
              <div className="flex pt-2">
                <button className="ml-auto bg-tangerine p-2 rounded hover:bg-skyblue" type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
  )
}
