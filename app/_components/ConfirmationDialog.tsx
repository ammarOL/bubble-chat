import { useEffect, useRef } from "react";

type ConfirmationDialogProps = {
  confirmLabel: string;
  description: string;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationDialog({
  confirmLabel,
  description,
  title,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="confirm-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        aria-describedby="confirm-description"
        aria-labelledby="confirm-title"
        aria-modal="true"
        className="confirm-dialog"
        ref={dialogRef}
        role="alertdialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }

          if (event.key === "Tab") {
            const focusableElements =
              dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
            const firstElement = focusableElements?.[0];
            const lastElement =
              focusableElements?.[focusableElements.length - 1];

            if (!firstElement || !lastElement) {
              return;
            }

            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }

            if (!event.shiftKey && document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }}
      >
        <div>
          <h2 className="confirm-title" id="confirm-title">
            {title}
          </h2>
          <p className="confirm-description" id="confirm-description">
            {description}
          </p>
        </div>
        <div className="confirm-actions">
          <button
            className="quiet-button compact-button"
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="primary-button danger-primary-button compact-button"
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
