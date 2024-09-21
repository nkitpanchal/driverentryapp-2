import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoClient } from 'mongodb'
import { compare } from 'bcrypt'
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required')
        }

        let client: MongoClient | null = null
        try {
          client = await MongoClient.connect(process.env.MONGODB_URI as string)
          const db = client.db()

          const user = await db.collection('users').findOne({ username: credentials.username })

          if (!user) {
            throw new Error('No user found')
          }

          const isValid = await compare(credentials.password, user.password)

          if (!isValid) {
            throw new Error('Invalid password')
          }

          return { id: user._id.toString(), name: user.username }
        } catch (error) {
          console.error('Authentication error:', error)
          throw error
        } finally {
          if (client) {
            await client.close()
          }
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)