import { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient, ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid driver ID' })
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI as string)
    const db = client.db()

    if (req.method === 'PUT') {
      const { name, dlNo, vehicleNumber, vehicleType } = req.body

      const result = await db.collection('drivers').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name,
            dlNo,
            vehicleNumber,
            vehicleType,
          },
        }
      )

      client.close()

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Driver not found' })
      }

      return res.status(200).json({ message: 'Driver updated successfully' })
    } else if (req.method === 'DELETE') {
      const result = await db.collection('drivers').deleteOne({ _id: new ObjectId(id) })

      client.close()

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Driver not found' })
      }

      return res.status(200).json({ message: 'Driver deleted successfully' })
    } else if (req.method === 'PATCH') {
      const { commissionReceived } = req.body

      const result = await db.collection('drivers').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            commissionReceived,
          },
        }
      )

      client.close()

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Driver not found' })
      }

      return res.status(200).json({ message: 'Commission status updated successfully' })
    } else {
      client.close()
      res.setHeader('Allow', ['PUT', 'DELETE', 'PATCH'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}