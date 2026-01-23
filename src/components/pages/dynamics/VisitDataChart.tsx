import { useNavigate } from 'react-router-dom'

export default function VisitDataChart() {
  const navigate = useNavigate()

  const data = [
    { date: '10/13/2025', planned: '100mg', actual: '100mg', cumDose: '100 mg', doseDensity: '100,000 mg/day' },
    { date: '10/20/2025', planned: '100mg', actual: '100mg', cumDose: '200 mg', doseDensity: '25,000 mg/day' },
    { date: '10/27/2025', planned: '100mg', actual: '100mg', cumDose: '300 mg', doseDensity: '20,000 mg/day' },
    { date: '11/3/2025', planned: '100mg', actual: '100mg', cumDose: '400 mg', doseDensity: '12,231 mg/day' },
    { date: '11/10/2025', planned: '100mg', actual: '100mg', cumDose: '500 mg', doseDensity: '17,241 mg/day' },
    { date: '11/17/2025', planned: '100mg', actual: '100mg', cumDose: '600 mg', doseDensity: '16,667 mg/day' },
    { date: '11/24/2025', planned: '100mg', actual: '100mg', cumDose: '700 mg', doseDensity: '16,279 mg/day' },
    { date: '12/1/2025', planned: '100mg', actual: '100mg', cumDose: '800 mg', doseDensity: '16,000 mg/day' },
    { date: '12/8/2025', planned: '100mg', actual: '100mg', cumDose: '900 mg', doseDensity: '15,789 mg/day' }
  ]

  return (
    <div className="pb-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Testosterone IM</h2>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">DATE</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">PLANNED</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">ACTUAL</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">CUM. DOSE</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">DOSE DENSITY</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.planned}</td>
                <td className="px-4 py-3">{row.actual}</td>
                <td className="px-4 py-3">{row.cumDose}</td>
                <td className="px-4 py-3">{row.doseDensity}</td>
              </tr>
            ))}
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
          Mark as completed
        </button>
      </div>
    </div>
  )
}
