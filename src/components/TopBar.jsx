function IconPlus() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

/**
 * Props:
 *   title           — string
 *   subtitle        — string | null
 *   actions         — [{ label, onClick, icon?, variant?, hideLabelMobile? }]
 *   onMenuToggle    — () => void   (мобильный гамбургер)
 */
export default function Topbar({ title, subtitle, actions = [], onMenuToggle }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 min-h-16 px-6 bg-white border-b border-zinc-200">
      {/* hamburger — только мобайл */}
      <button
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors"
        onClick={onMenuToggle}
        aria-label="Открыть меню"
      >
        <IconMenu />
      </button>

      {/* title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[22px] font-bold tracking-tight text-zinc-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-zinc-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* actions */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={[
                "h-8 px-3 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-md transition-colors",
                action.variant === "secondary"
                  ? "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  : action.variant === "ghost"
                  ? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  : "bg-zinc-900 hover:bg-zinc-700 text-white",
              ].join(" ")}
            >
              {action.icon ?? <IconPlus />}
              <span className={action.hideLabelMobile ? "hidden sm:inline" : ""}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </header>
  )
}