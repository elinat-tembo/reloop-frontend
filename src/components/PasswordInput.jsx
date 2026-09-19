import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={className} />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        {visible ? (
          <EyeSlashIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default PasswordInput;
