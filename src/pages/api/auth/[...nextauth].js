import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { verifyPassword } from '../../../lib/auth'
import { connectToDatabase } from '../../../lib/db'

export const authOptions = {
  session: {
    jwt: true,
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: 'E-mail', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const client = await connectToDatabase()

        const usersCollection = client.db().collection('users')

        const user = await usersCollection.findOne({
          email: credentials.email,
        })

        console.log(user)

        if (!user) {
          client.close()
          return null
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          client.close()
          return null
        }

        client.close()
        return { id: user._id, name: '', email: user.email }
      },
    }),
  ],
}

export default NextAuth(authOptions)
