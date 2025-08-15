import { X } from "lucide-react";

export default function ActivityOptionsModal({ isOpen, onClose, activityName, options, onSelect }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-xl sm:rounded-xl text-gray-900 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{activityName}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose an option to begin:
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 ml-4"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => onSelect(opt)}
                className="flex flex-col items-start p-4 rounded-lg border hover:shadow-md transition bg-gray-50 text-left"
              >
                <div className="flex items-center gap-3">
                  <opt.icon className="w-5 h-5 text-gray-700" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{opt.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{opt.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
