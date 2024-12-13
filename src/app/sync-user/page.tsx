import { db } from '@/server/db'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

const SyncUser = async () => {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("user not found")
    }
    const client = clerkClient()
    const user = await (await client).users.getUser(userId)
    if (!user.emailAddresses[0]?.emailAddress) {
        return notFound()
    }


    await db.user.upsert({
        where: {
            emailAddress: user.emailAddresses[0]?.emailAddress ?? " "
        },
        create: {
            id: user.id,
            emailAddress: user.emailAddresses[0]?.emailAddress ?? " ",
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        update: {
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        }
    })
    return redirect('/dashboard')
}

export default SyncUser
