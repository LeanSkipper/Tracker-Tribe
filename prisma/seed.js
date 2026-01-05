const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'tiago@example.com' },
        update: {},
        create: {
            email: 'tiago@example.com',
            name: 'Tiago',
            role: 'Visionary'
        }
    })

    const tribes = [
        { id: '1', name: 'Business Mastermind', type: 'Business' },
        { id: '2', name: 'Health Elite', type: 'Health' },
        { id: '3', name: 'Personal Growth', type: 'Personal' }
    ]

    for (const t of tribes) {
        await prisma.tribe.upsert({
            where: { id: t.id },
            update: { name: t.name, type: t.type },
            create: { id: t.id, name: t.name, type: t.type }
        })
    }

    console.log('Seed completed.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
