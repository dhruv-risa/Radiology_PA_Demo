import { useParams } from 'react-router-dom'
import { getOrderByMRN } from '../../../utils/patientDataHelpers'

export default function Overview() {
  const { id } = useParams()
  const orderData = getOrderByMRN(id!)

  if (!orderData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No order data found</p>
      </div>
    )
  }

  const { order, payer, paStatus } = orderData
  const provider = order.orderingProvider

  const getAutomationStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700'
      case 'In Progress':
        return 'bg-blue-100 text-blue-700'
      case 'Blocked':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Generate last system action message
  const getLastSystemAction = () => {
    if (paStatus.AutomationWorkflow === 'Completed') {
      if (paStatus.authStatus === 'NAR') {
        return 'Authorization check completed - No authorization required'
      }
      if (paStatus.authStatus === 'Auth on File') {
        return 'Authorization verified - Valid authorization on file'
      }
    }
    if (paStatus.AutomationWorkflow === 'In Progress') {
      return 'Prior authorization submitted, awaiting payer response'
    }
    if (paStatus.AutomationWorkflow === 'Blocked') {
      return `Automation paused - ${paStatus.authStatus}`
    }
    return 'Eligibility verification completed'
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Order Summary and Coverage Snapshot */}
      <div className="grid grid-cols-2 gap-3">
        {/* Section 1: Order Summary */}
        <div className="bg-white border rounded p-3">
          <h3 className="text-xs font-semibold mb-2">Order Summary</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Imaging Type</div>
                <div className="text-[10px] font-medium text-gray-900">{order.imagingType}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">CPT Code(s)</div>
                <div className="text-[10px] font-medium text-gray-900">{order.cptCodes.join(', ')}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Date of Service</div>
                <div className="text-[10px] font-medium text-gray-900">
                  {new Date(order.dateOfService).toLocaleDateString('en-US')}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Provider Network Status</div>
                <div className="text-[10px] font-medium text-gray-900">{provider.networkStatus}</div>
              </div>
            </div>
            <div className="pt-1 border-t">
              <div className="text-[10px] text-gray-500 mb-0.5">Ordering Provider Name</div>
              <div className="text-[10px] font-medium text-gray-900">{provider.name}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Coverage Snapshot */}
        <div className="bg-white border rounded p-3">
          <h3 className="text-xs font-semibold mb-2">Coverage Snapshot</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Coverage Status</div>
                <div className="text-[10px] font-medium text-green-700">Eligibility Verified</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Payer Name</div>
                <div className="text-[10px] font-medium text-gray-900">{payer.name}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Plan Status</div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${payer.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  <span className="text-[10px] font-medium text-gray-900">{payer.status}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Plan Name</div>
                <div className="text-[10px] font-medium text-gray-900">{payer.planName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Automation Status and Workflow Milestones */}
      <div className="grid grid-cols-2 gap-3">
        {/* Automation Status */}
        <div className="bg-white border rounded p-3">
          <h3 className="text-xs font-semibold mb-2">Automation Status & Alerts</h3>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-gray-500 mb-1.5">Automation Status</div>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${getAutomationStatusColor(paStatus.AutomationWorkflow)}`}>
                {paStatus.AutomationWorkflow}
              </span>
            </div>
            <div className="pt-1.5 border-t">
              <div className="text-[10px] text-gray-500 mb-0.5">Last System Action</div>
              <div className="text-[10px] text-gray-700 leading-relaxed">{getLastSystemAction()}</div>
            </div>
          </div>
        </div>

        {/* Workflow Milestones */}
        <div className="bg-white border rounded p-3">
          <h3 className="text-xs font-semibold mb-2">Workflow Milestones</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold text-xs">✓</span>
              <span className="text-[10px] text-gray-700">Eligibility Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold text-xs">✓</span>
              <span className="text-[10px] text-gray-700">Policy Evaluated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold text-xs">✓</span>
              <span className="text-[10px] text-gray-700">Authorization Checked</span>
            </div>
            <div className="flex items-center gap-2">
              {paStatus.AutomationWorkflow === 'Completed' ? (
                <>
                  <span className="text-green-600 font-semibold text-xs">✓</span>
                  <span className="text-[10px] text-gray-700">Validation Completed</span>
                </>
              ) : paStatus.AutomationWorkflow === 'Blocked' ? (
                <>
                  <span className="text-red-600 font-semibold text-xs">✗</span>
                  <span className="text-[10px] text-gray-700">Validation Blocked</span>
                </>
              ) : (
                <>
                  <span className="text-blue-600 font-semibold text-xs">⋯</span>
                  <span className="text-[10px] text-gray-700">Validation In Progress</span>
                </>
              )}
            </div>
            {paStatus.authStatus === 'PA Submitted' && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-semibold text-xs">⋯</span>
                <span className="text-[10px] text-gray-700">Submission Triggered</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
