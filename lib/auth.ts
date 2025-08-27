import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { poolPromise, sql } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const pool = await poolPromise
          const result = await pool
            .request()
            .input('email', credentials.email)
            .query('SELECT IdUser, Email, PasswordHash, FirstName, LastName, IsAdmin FROM [benjaise_sqluser].[UsersWebsite] WHERE Email = @email')

          const user = result.recordset[0]
          
          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.PasswordHash)
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.IdUser.toString(),
            email: user.Email,
            name: user.FirstName && user.LastName ? `${user.FirstName} ${user.LastName}` : user.Email,
            isAdmin: user.IsAdmin,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        ;(session.user as any).isAdmin = token.isAdmin
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: 'jwt',
  },
}