import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  return null
}