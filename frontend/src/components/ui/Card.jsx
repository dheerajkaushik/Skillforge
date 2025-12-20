export default function Card({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      {children}
    </div>
  );
}
