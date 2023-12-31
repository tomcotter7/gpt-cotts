export function ToastBox({ toasts, setToasts }) {

  function deleteToast(key) {
    var newToasts = { ...toasts }
    delete newToasts[key]
    setToasts(newToasts)
  }

  return (
    <div className="fixed right-5 flex flex-col space-y-12">
      {Object.keys(toasts).map((key) => {
        return (
          <Toast
            key={key}
            id={key}
            message={toasts[key].message}
            success={toasts[key].success}
            onDelete={deleteToast}
            />
        )
      })}
    </div>
  )
}

export function Toast({ id, message, success, onDelete }) {
  var color = "bg-red-400"

  var icon = () => {
    
    return (
        <span class="mr-2 h-4 w-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
              clipRule="evenodd" />
          </svg>
        </span>
    )
  }

  if (success) {
    color = "bg-green-400"
    icon = () => {
      return (
        <span className="mr-2 h-4 w-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd" />
          </svg>
        </span>
      )
    }
  }

  const rootClassNames = "fixed right-5 pointer-events-auto mx-auto mb-4 w-96 rounded-lg text-sm shadow-lg shadow-black/5 " + color
  
  return (
    <div
      className={rootClassNames}
      id="static-example">
    <div
      className="flex items-center justify-between px-4 pb-2 pt-2.5">
      <p className="flex items-center font-bold text-success-700">
        {icon()}
        {message}
      </p>
      <div className="flex items-center">
        <button
          type="button"
          className="ml-2 box-content rounded-none border-none opacity-80 hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
          onClick={() => onDelete(id)}
          >
          <span
            className="w-[1em]">
            <svg
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
  )
}
