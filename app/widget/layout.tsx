/**
 * Widget-specific layout — runs inside a cross-origin iframe embedded on customer websites.
 * MUST have a transparent background so the host site shows through.
 * Uses postMessage to tell embed.js to resize the iframe as the widget opens/closes.
 */
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Override the root layout's white body background */}
      <style>{`
        html, body {
          background: transparent !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      {children}
    </>
  )
}
