import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    id_token: string
    access_token: string
    expires_at: number
    user: {
      name: string
      email: string
    }
    error: string
  }
}
