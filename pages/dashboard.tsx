import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

type Driver = {
  _id: string
  driverId: string
  name: string
  dlNo: string
  vehicleNumber: string
  vehicleType: string
  lastVisitedDhaba: string
  visits: number
  totalVisits: number
  eligibleForCommission: boolean
  commissionReceived: boolean
}

export default function Dashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchDrivers()
    }
  }, [status, router])

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

  const deleteDriver = async (id: string) => {
    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchDrivers()
      } else {
        console.error('Failed to delete driver')
      }
    } catch (error) {
      console.error('Error deleting driver:', error)
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

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingDriver(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDriver) return

    try {
      const response = await fetch(`/api/drivers/${editingDriver._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingDriver),
      })

      if (response.ok) {
        fetchDrivers()
        closeEditModal()
      } else {
        console.error('Failed to update driver')
      }
    } catch (error) {
      console.error('Error updating driver:', error)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Driver Dashboard</h1>
          <Link href="/add-driver" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto text-center">
            Add New Driver
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by DL number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
          />
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DL Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dhaba Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.driverId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.name}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(driver)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDriver(driver._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isEditModalOpen && editingDriver && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Driver Information</h3>
              <form onSubmit={handleEditSubmit} className="mt-2 text-left">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={editingDriver.name}
                    onChange={(e) => setEditingDriver({...editingDriver, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="dlNo" className="block text-sm font-medium text-gray-700">DL Number</label>
                  <input
                    type="text"
                    id="dlNo"
                    value={editingDriver.dlNo}
                    onChange={(e) => setEditingDriver({...editingDriver, dlNo: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    id="vehicleNumber"
                    value={editingDriver.vehicleNumber}
                    onChange={(e) => setEditingDriver({...editingDriver, vehicleNumber: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <input
                    type="text"
                    id="vehicleType"
                    value={editingDriver.vehicleType}
                    onChange={(e) => setEditingDriver({...editingDriver, vehicleType: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    id="ok-btn"
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
              <div className="items-center px-4 py-3">
                <button
                  id="cancel-btn"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}