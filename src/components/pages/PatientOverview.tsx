import { useNavigate } from 'react-router-dom'

export default function PatientOverview() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-semibold">DANIEL TOCCI (8680739)</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
            Validate
          </button>
          <button className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50">
            Report Inaccuracy
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-6 py-4 bg-white mb-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded">Primary - United Healthcare</span>
        </div>
      </div>

      <div className="flex gap-6 px-6 py-4">
        <div className="w-80 bg-white border rounded p-4 space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Date of Birth</span>
            <span className="text-sm font-medium">04/14/1975</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Member ID</span>
            <span className="text-sm font-medium">901265254</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Status</span>
            <span className="text-sm font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Provider</span>
            <span className="text-sm font-medium">Samir Patel</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Provider NPI</span>
            <span className="text-sm font-medium">1174757619</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Service Type</span>
            <span className="text-sm font-medium">: 7B</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Effective Date</span>
            <span className="text-sm font-medium">01/01/2026</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Plan End Date</span>
            <span className="text-sm font-medium">12/31/2026</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Plan Name</span>
            <span className="text-sm font-medium">: UNITEDHEALTHCARE CHOIC...</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Date of Service</span>
            <span className="text-sm font-medium">02/02/2026</span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="bg-white border rounded p-5">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">Deductibles</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Individual</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-xs text-gray-500">Used</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">$0</span>
                    <span className="text-sm font-medium">$0</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-xs text-gray-500">Used</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">$0</span>
                    <span className="text-sm font-medium">$0</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">In-Network</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Individual</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-xs text-gray-500">Used</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">$1050.00</span>
                    <span className="text-sm font-medium">$268.50</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-xs text-gray-500">Used</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">$3050.00</span>
                    <span className="text-sm font-medium">$1168.50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded p-5">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-3">Out-of-Pocket</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium">In-Network</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Individual</span>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total</div>
                  <div className="text-sm font-medium">$1050.00</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Used</div>
                  <div className="text-sm font-medium">$268.50</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total</div>
                  <div className="text-sm font-medium">$3050.00</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Used</div>
                  <div className="text-sm font-medium">$1168.32</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-3">
                <div className="mb-2">Category - Chemotherapy</div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Copay</div>
                    <div className="font-medium">$0</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Coinsurance</div>
                    <div className="font-medium">0%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">In-Network</span>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Family</span>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Total</div>
                <div className="text-sm font-medium">$3050.00</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Used</div>
                <div className="text-sm font-medium">$1168.32</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Total</div>
                <div className="text-sm font-medium">$9050.00</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Used</div>
                <div className="text-sm font-medium">$1168.32</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex justify-between z-20">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/patient/8680739/pa-orders')}
          className="px-6 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
