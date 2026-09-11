const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

console.log("Cloudinary Cloud Name:", CLOUD_NAME);
console.log("Cloudinary Upload Preset:", UPLOAD_PRESET);
export function openImageUploadWidget({
  onStart,
  onSuccess,
  onFinish,
  onError,
}) {
  if (!window.cloudinary) {
    onError?.("Image upload isn’t ready yet — please try again in a moment.");
    return;
  }

  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      multiple: true,
      sources: ["local", "url", "camera"],
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        onError?.(error.statusText || error.message || "Image upload failed.");
        onFinish?.();
        return;
      }

      switch (result.event) {
        case "queues-start":
          onStart?.();
          break;
        case "success":
          onSuccess?.(result.info.secure_url);
          break;
        case "queues-end":
        case "close":
          onFinish?.();
          break;
        default:
          break;
      }
    },
  );

  widget.open();
}
