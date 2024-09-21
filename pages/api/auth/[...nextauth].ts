import NextAuth from 'next-auth'
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

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const client = await MongoClient.connect(process.env.MONGODB_URI as string)
        const db = client.db()

        const user = await db.collection('users').findOne({ username: credentials?.username })

        if (!user) {
          client.close()
          throw new Error('No user found')
        }

        const isValid = await compare(credentials?.password as string, user.password)

        if (!isValid) {
          client.close()
          throw new Error('Invalid password')
        }

        client.close()
        return { id: user._id.toString(), name: user.username }
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
})