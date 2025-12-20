export default function Progress({ value }) {
  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div
        className="bg-emerald-500 h-2 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
