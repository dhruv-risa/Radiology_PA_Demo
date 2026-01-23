import { useNavigate } from 'react-router-dom'

export default function Drugs() {
  const navigate = useNavigate()

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          <span className="text-blue-600 cursor-pointer hover:underline">View Tx Plan</span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50">
            Report Inaccuracy
          </button>
          <button className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Date From ⇅</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Date To ⇅</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">J Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Total Visits</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Remaining</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Completed</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Auth Required</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3">Q5115</td>
              <td className="px-4 py-3">Truxima (ritaximab-abbs) IV</td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <select className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-yellow-700 bg-yellow-50">
                  <option>Auth Required</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex justify-between z-20">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Go Back
        </button>
        <button
          onClick={() => {}}
          className="px-6 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          Shift to Auth Required Queue
        </button>
      </div>
    </div>
  )
}
