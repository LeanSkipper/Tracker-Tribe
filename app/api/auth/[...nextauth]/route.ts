import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            }
        }),
        // Add Google Provider
        // Note: Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
        // And the new Redirect URI: https://www.tntlapis.com/api/auth/callback/google
        {
            id: 'google',
            name: 'Google',
            type: 'oauth',
            wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
            authorization: { params: { scope: 'openid email profile' } },
            idToken: true,
            checks: ['pkce', 'state'],
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            },
        }
    ],
    callbacks: {
        async signIn({ user }) {
            // Allow all sign-ins for credentials provider
            return true;
        },
        async session({ session, token }) {
            // Pass user data from JWT token to session
            if (session.user && token) {
                session.user.id = token.sub || '';
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            // On sign-in, add user data to JWT token
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        }
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
