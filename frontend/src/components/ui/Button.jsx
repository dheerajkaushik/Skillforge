export default function Button({ children, variant="primary", ...props }) {
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    success: "bg-emerald-500 text-white hover:bg-emerald-600",
    outline: "border border-slate-300 hover:bg-slate-100"
  }

  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium ${styles[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}
