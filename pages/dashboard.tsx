import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
// Updated imports for UI components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Label,
    Input,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from '../components/ui-components'

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

const vehicleTypes = [
  "Truck",
  "Bus",
  "Van",
  "Car",
  "Motorcycle",
  "Other"
]

export default function Dashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const router = useRouter()
  const { status } = useSession()

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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingDriver) {
      setEditingDriver({ ...editingDriver, [e.target.name]: e.target.value })
    }
  }

  const handleVehicleTypeChange = (value: string) => {
    if (editingDriver) {
      setEditingDriver({ ...editingDriver, vehicleType: value })
    }
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

      <Dialog open={isEditModalOpen} onClose={closeEditModal}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Driver Information</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
            <div className="space-y-4">
                <div>
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={editingDriver?.name || ''}
                    onChange={handleEditChange}
                />
                </div>
                <div>
                <Label htmlFor="dlNo">DL Number</Label>
                <Input
                    id="dlNo"
                    name="dlNo"
                    value={editingDriver?.dlNo || ''}
                    onChange={handleEditChange}
                />
                </div>
                <div>
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                    id="vehicleNumber"
                    name="vehicleNumber"
                    value={editingDriver?.vehicleNumber || ''}
                    onChange={handleEditChange}
                />
                </div>
                <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                    id="vehicleType"
                    value={editingDriver?.vehicleType || ''}
                    onChange={(e) => handleVehicleTypeChange(e.target.value)}
                >
                    <SelectValue placeholder="Select vehicle type" />
                    {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                        {type}
                    </SelectItem>
                    ))}
                </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Save changes</Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    </Layout>
  )
}