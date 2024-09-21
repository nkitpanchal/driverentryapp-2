import { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient, Db, ObjectId } from 'mongodb'

let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI as string)
    const db = client.db()
    cachedDb = db
    return db
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    throw error
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase()

    if (req.method === 'GET') {
      try {
        const drivers = await db.collection('drivers').find({}).toArray()
        res.status(200).json(drivers)
      } catch (error) {
        console.error('Error fetching drivers:', error)
        res.status(500).json({ 
          message: 'Error fetching drivers', 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    } else if (req.method === 'POST') {
      try {
        const { dlNo, lastVisitedDhaba, ...driverData } = req.body

        const existingDriver = await db.collection('drivers').findOne({
          dlNo,
          lastVisitedDhaba
        })

        if (existingDriver) {
          const currentVisits = existingDriver.visits || 0
          const currentTotalVisits = existingDriver.totalVisits || 0
          const newVisits = currentVisits + 1
          const newTotalVisits = currentTotalVisits + 1

          const updateData: {
            $set: {
              name: string;
              mobile: string;
              vehicleNumber: string;
              vehicleType: string;
              lastVisitedDhaba: string;
              visits: number;
              totalVisits: number;
              eligibleForCommission?: boolean;
              commissionReceived?: boolean;
            }
          } = {
            $set: { 
              name: driverData.name,
              mobile: driverData.mobile,
              vehicleNumber: driverData.vehicleNumber,
              vehicleType: driverData.vehicleType,
              lastVisitedDhaba: lastVisitedDhaba,
              visits: newVisits,
              totalVisits: newTotalVisits
            }
          }

          if (newVisits === 4) {
            updateData.$set.eligibleForCommission = true
          }

          if (newVisits > 4 && existingDriver.commissionReceived) {
            updateData.$set.visits = 1
            updateData.$set.commissionReceived = false
            updateData.$set.eligibleForCommission = false
          }

          const result = await db.collection('drivers').updateOne(
            { _id: new ObjectId(existingDriver._id) },
            updateData
          )
          res.status(200).json({ message: 'Driver updated successfully', result })
        } else {
          const result = await db.collection('drivers').insertOne({
            ...req.body,
            visits: 1,
            totalVisits: 1,
            eligibleForCommission: false,
            commissionReceived: false
          })
          res.status(201).json({ message: 'Driver added successfully', result })
        }
      } catch (error) {
        console.error('Error adding/updating driver:', error)
        res.status(500).json({ 
          message: 'Error adding/updating driver', 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Unhandled error in API route:', error)
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
}