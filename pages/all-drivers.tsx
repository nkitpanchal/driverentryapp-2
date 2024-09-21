import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'

type Driver = {
  _id: string
  driverId: string
  name: string
  mobile: string
  dlNo: string
  vehicleNumber: string
  vehicleType: string
  visits: number
  totalVisits: number
  lastVisitedDhaba: string
  eligibleForCommission: boolean
  commissionReceived: boolean
}

export default function AllDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])

  useEffect(() => {
    fetchDrivers()
  }, [])

  useEffect(() => {
    setFilteredDrivers(
      drivers.filter((driver) =>
        driver.dlNo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, drivers])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      } else {
        console.error('Failed to fetch drivers')
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const updateCommissionStatus = async (driverId: string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commissionReceived: true }),
      })
      if (response.ok) {
        fetchDrivers()
      } else {
        console.error('Failed to update commission status')
      }
    } catch (error) {
      console.error('Error updating commission status:', error)
    }
  }

  return (
    <Layout>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-black mb-4 sm:mb-0">All Drivers</h1>
          <Link href="/add-driver" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto text-center">
            Add/Update Driver
          </Link>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by DL number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
          />
        </div>
        {filteredDrivers.length === 0 ? (
          <p className="text-gray-600">No drivers found. Add some drivers to see them here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DL No.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visited Dhaba</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.driverId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.dlNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.vehicleNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.vehicleType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.visits}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.totalVisits}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.lastVisitedDhaba}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.eligibleForCommission ? (
                        driver.commissionReceived ? (
                          <span className="text-green-600">Commission Received</span>
                        ) : (
                          <button
                            onClick={() => updateCommissionStatus(driver._id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs sm:text-sm"
                          >
                            Mark as Received
                          </button>
                        )
                      ) : (
                        <span className="text-yellow-600">Not Eligible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}