function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-secondary/30 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-secondary/30 px-6 py-4">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
