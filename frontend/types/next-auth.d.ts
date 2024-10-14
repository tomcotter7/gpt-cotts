import NextAuth from 'next-auth'

declare module 'next-auth' {
    interface Session {
        access_token: string
        expires: number
        user: {
            name: string
            email: string
        }
        error: string
    }
}
