import PageContainer from "../components/layout/PageContainer"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"

export default function AdminDashboard() {
  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <span className="text-sm text-gray-500">Manage Users & Roles</span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Email</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* Sample Row 1 */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">Dheeraj</td>
                <td className="p-4 text-gray-600">user@skillforge.local</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                    USER
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button variant="outline" size="sm">Promote</Button>
                </td>
              </tr>

              {/* Sample Row 2 (Added for visual check) */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">Sarah Smith</td>
                <td className="p-4 text-gray-600">sarah@skillforge.local</td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                    INSTRUCTOR
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button variant="outline" size="sm">Manage</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  )
}