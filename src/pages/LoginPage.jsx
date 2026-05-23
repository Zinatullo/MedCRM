import { useState } from "react"

/**
 * Props:
 *   clinicName  — string
 *   clinicLogo  — string (base64 или URL) | null
 *   onLogin     — ({ login, password }) => void | Promise<void>
 *   error       — string | null  (ошибка от родителя, например «Неверный пароль»)
 *   loading     — boolean
 */
export default function LoginPage({
  clinicName = "PROlab Medical",
  clinicLogo = null,
  onLogin,
  error: externalError = null,
  loading = false,
}) {
  const [form, setForm]   = useState({ login: "admin", password: "demo" })
  const [error, setError] = useState(null)
  const [busy, setBusy]   = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.login.trim())    { setError("Введите логин");  return }
    if (!form.password.trim()) { setError("Введите пароль"); return }
    setBusy(true)
    try {
      await onLogin?.({ login: form.login, password: form.password })
    } catch (err) {
      setError(err?.message || "Ошибка входа")
    } finally {
      setBusy(false)
    }
  }

  const displayError = externalError || error
  const isLoading    = loading || busy
  const logoLetter   = (clinicName || "P")[0].toUpperCase()

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-6">
      <div className="w-full max-w-[380px]">

        {/* card */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm px-8 py-8">

          {/* logo */}
          <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-[16px] mb-5 overflow-hidden">
            {clinicLogo ? (
              <img src={clinicLogo} alt="logo" className="w-full h-full object-contain block" />
            ) : (
              logoLetter
            )}
          </div>

          {/* heading */}
          <h1 className="text-[20px] font-semibold text-zinc-900 mb-1">
            {clinicName}
          </h1>
          <p className="text-[13px] text-zinc-500 mb-6">Войдите в систему</p>

          {/* form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Логин"
              autoComplete="username"
              value={form.login}
              onChange={set("login")}
              disabled={isLoading}
              className="w-full h-9 px-3 text-[14px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              type="password"
              placeholder="Пароль"
              autoComplete="current-password"
              value={form.password}
              onChange={set("password")}
              disabled={isLoading}
              className="w-full h-9 px-3 text-[14px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* error */}
            {displayError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-[12.5px] text-red-700">
                <span className="shrink-0">⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 h-9 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white text-[14px] font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span>Вход…</span>
                </>
              ) : (
                "Войти"
              )}
            </button>
          </form>

          {/* demo hint */}
          <div className="mt-5 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-[12px] text-zinc-500 leading-relaxed">
            <span className="font-medium text-zinc-700">Демо-доступ:</span> логин{" "}
            <span className="font-medium text-zinc-900">admin</span> / пароль{" "}
            <span className="font-medium text-zinc-900">demo</span>.<br />
            Все данные сохраняются в браузере.
          </div>
        </div>

      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}