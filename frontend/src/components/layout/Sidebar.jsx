export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-screen p-5">
      <h1 className="text-xl font-bold text-indigo-600">SkillForge</h1>

      <nav className="mt-8 space-y-3 text-sm">
        <a className="block hover:text-indigo-600">Dashboard</a>
        <a className="block hover:text-indigo-600">My Courses</a>
        <a className="block hover:text-indigo-600">Instructor</a>
        <a className="block hover:text-indigo-600">Admin</a>
      </nav>
    </aside>
  )
}
