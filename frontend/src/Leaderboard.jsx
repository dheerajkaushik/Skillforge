import { useEffect, useState } from "react";
import axios from "axios";

export default function Leaderboard({ problemId }) {
  // ✅ FIX: Define token at the top level so it is ALWAYS available
  const token = localStorage.getItem("sf_token");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!problemId) return;

    // 1. Check if token exists immediately
    if (!token) {
        setError("Please login to view the leaderboard.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    axios
      .get(`http://localhost:8080/api/analytics/leaderboard/${problemId}`, {
        headers: {
           // ✅ Token is definitely defined now because it's at the component top level
           Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setRows(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard", err);
        // Handle 403 Forbidden specifically
        if (err.response && err.response.status === 403) {
            setError("Access denied. Token invalid or expired.");
        } else {
            setError("Could not load leaderboard.");
        }
        setLoading(false);
      });

  }, [problemId, token]); // ✅ Added 'token' to dependencies

  return (
    <div className="mt-8 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🏆 Top Performers</h2>

      {loading && <p className="text-gray-500">Loading leaderboard...</p>}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-3 font-semibold text-gray-700 w-16">Rank</th>
                <th className="p-3 font-semibold text-gray-700">Student ID</th>
                <th className="p-3 font-semibold text-gray-700 text-right">Accepted Solutions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 font-medium text-gray-600">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </td>
                    <td className="p-3 font-mono text-blue-600">{r[0]}</td>
                    <td className="p-3 text-right font-bold text-green-600">{r[1]}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500 italic">
                    No submissions yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}