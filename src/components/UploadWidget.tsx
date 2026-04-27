import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { UploadWidgetValue } from "@/types";
import { UploadCloud } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

const UploadWidget = ({
  value = null,
  onChange,
  disabled = false,
}: {
  value: UploadWidgetValue | null;
  onChange: (file: UploadWidgetValue | null) => void;
  disabled?: boolean;
}) => {
  const widgetRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const [previewUrl, setPreviewUrl] = useState<UploadWidgetValue | null>(value);
  const openWidget = () => {
    if (!disabled) {
      widgetRef.current?.open();
    }
  };

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // Bug 1 fixed: was !== which skipped on client and ran on SSR
    if (typeof window === "undefined") return;

    const initializedWidget = () => {
      if (!window.cloudinary || widgetRef.current) return false;

      // Bug 2 fixed: missing closing ) for createUploadWidget options object
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          multiple: false,
          folder: "upload",
          maxFileSize: 5 * 1024 * 1024,
          clientAllowedFormats: ["png", "jpg", "jpeg"],
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            const payload: UploadWidgetValue = {
              url: result.info.secure_url,
              publicId: result.info.public_id,
            };
            setPreviewUrl(payload);

            onChangeRef.current?.(payload);
          }
        },
      );

      // Bug 3 fixed: return true was unreachable inside the callback
      return true;
    };

    // Bug 4 fixed: these were trapped inside the widget callback's closure
    if (initializedWidget()) return;

    // Bug 5 fixed: interval now retries initializedWidget and clears on success
    const intervalId = window.setInterval(() => {
      if (initializedWidget()) {
        window.clearInterval(intervalId);
      }
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="upload-preview">
          <img src={previewUrl.url} alt="Preview" />
        </div>
      ) : (
        <div
          className="upload-dropzone"
          role="button"
          tabIndex={0}
          onClick={openWidget}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              openWidget();
            }
          }}
        >
          <div className="upload-prompt">
            <UploadCloud className="icon" />
            <div>
              <p>Click to upload photo</p>
              <p>PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadWidget;
