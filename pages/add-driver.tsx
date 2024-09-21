import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

interface Driver {
  _id?: string
  driverId: string
  name: string
  mobile: string
  dlNo: string
  vehicleNumber: string
  vehicleType: string
  visits: number
  lastVisitedDhaba: string
}

const dhabas = [
  "Amrik Sukhdev Dhaba, Murthal",
  "Gulshan Ka Dhaba, Ambala",
  "Pahalwan Dhaba, Rohtak",
  "Zhilmil Dhaba, Karnal",
  "Bhartu Da Dhaba, Sonipat",
  "Pehalwan Dhaba, Panipat",
  "Mannat Dhaba, Kurukshetra",
  "Rao Dhaba, Gurgaon",
  "Garam Dharam Dhaba, Murthal",
  "Sitara Dhaba, Panipat"
]

const vehicleTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Bus",
  "Truck",
  "Van",
  "Pickup"
]

export default function AddDriver() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [dlNo, setDlNo] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [selectedDhaba, setSelectedDhaba] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const router = useRouter()

  const formatMobile = (input: string) => {
    const cleaned = input.replace(/\D/g, '')
    return cleaned.slice(0, 10)
  }

  const formatDL = (input: string) => {
    const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const letters = cleaned.slice(0, 2)
    const numbers = cleaned.slice(2, 15).replace(/\D/g, '')
    return `${letters}${numbers}`
  }

  const formatVehicleNumber = (input: string) => {
    const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    return cleaned
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobile(e.target.value)
    setMobile(formatted)
  }

  const handleDLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDL(e.target.value)
    setDlNo(formatted)
  }

  const handleVehicleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatVehicleNumber(e.target.value)
    setVehicleNumber(formatted)
  }

  const validateInputs = () => {
    if (mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits')
      return false
    }

    if (dlNo.length !== 15 || !/^[A-Z]{2}\d{13}$/.test(dlNo)) {
      setError('DL number must be in the format XX0000000000000 (2 letters followed by 13 numbers)')
      return false
    }

    if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(vehicleNumber)) {
      setError('Vehicle number must be in the format XX00XX0000 or XX00X0000')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInputs()) return

    const driverData: Driver = {
      driverId: `${selectedDhaba.substring(0, 3).toUpperCase()}-${Date.now()}`,
      name,
      mobile,
      dlNo,
      vehicleNumber,
      vehicleType,
      visits: 1,
      lastVisitedDhaba: selectedDhaba
    }

    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(result.message)
        setError('')
        // Clear form fields
        setName('')
        setMobile('')
        setDlNo('')
        setVehicleNumber('')
        setVehicleType('')
        setSelectedDhaba('')
        // Redirect to all-drivers page after 2 seconds
        setTimeout(() => {
          router.push('/all-drivers')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(`Failed to add/update driver: ${errorData.message}. ${errorData.error || ''}`)
        setSuccess('')
      }
    } catch (error) {
      console.error('Error adding/updating driver:', error)
      setError(`An error occurred while adding/updating the driver: ${(error as Error).message}`)
      setSuccess('')
    }
  }

  return (
    <Layout>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-black mb-6">Add/Update Driver</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
            <input
              type="tel"
              id="mobile"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
              value={mobile}
              onChange={handleMobileChange}
              placeholder="10 digit number"
              required
              maxLength={10}
            />
          </div>
          <div>
            <label htmlFor="dlNo" className="block text-sm font-medium text-gray-700">DL No.</label>
            <input
              type="text"
              id="dlNo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
              value={dlNo}
              onChange={handleDLChange}
              placeholder="XX0000000000000"
              required
              maxLength={15}
            />
          </div>
          <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">Vehicle Number</label>
            <input
              type="text"
              id="vehicleNumber"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
              value={vehicleNumber}
              onChange={handleVehicleNumberChange}
              placeholder="XX00XX0000"
              required
              maxLength={10}
            />
          </div>
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <select
              id="vehicleType"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              required
            >
              <option value="">Select a vehicle type</option>
              {vehicleTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dhaba" className="block text-sm font-medium text-gray-700">Dhaba</label>
            <select
              id="dhaba"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
              value={selectedDhaba}
              onChange={(e) => setSelectedDhaba(e.target.value)}
              required
            >
              <option value="">Select a dhaba</option>
              {dhabas.map((dhaba, index) => (
                <option key={index} value={dhaba}>{dhaba}</option>
              ))}
            </select>
          </div>
          <div>
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Add/Update Driver
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}