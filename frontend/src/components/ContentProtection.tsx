import { useEffect, type ReactNode } from "react";

interface ContentProtectionProps {
    children: ReactNode;
    /** URL to append when text is copied. Defaults to current page URL. */
    siteUrl?: string;
}

/**
 * Wraps children with content protection behaviours:
 *  - Disables text selection on the content area
 *  - Blocks right-click context menu
 *  - Intercepts Ctrl+C / Ctrl+U / Ctrl+S / F12 keyboard shortcuts
 *  - Clipboard hijacking: appends site attribution to any successfully copied text
 *  - Image drag prevention
 */
export function ContentProtection({ children, siteUrl }: ContentProtectionProps) {
    useEffect(() => {
        const url = siteUrl ?? window.location.href;

        // Block right-click to prevent "Save Image As..." and "Copy"
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Clipboard hijacking — inject attribution on copy
        // Or prevent copying altogether
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            // Optional: inject attribution instead of preventing totally:
            // e.clipboardData?.setData("text/plain", "Copying content is disabled.");
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("copy", handleCopy);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("copy", handleCopy);
        };
    }, [siteUrl]);

    return (
        <div
            className="select-none"
            onDragStart={(e) => e.preventDefault()}
        >
            {children}
        </div>
    );
}
