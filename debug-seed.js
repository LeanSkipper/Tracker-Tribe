const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), "dev.db");
console.log("Connecting to DB at:", dbPath);

// Initialize Adapter
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Create Main User
    const email = 'tiago.mance@gmail.com';
    console.log(`Checking user ${email}...`);

    let u = await prisma.user.findUnique({ where: { email } });

    if (!u) {
        console.log("Creating Admin User: Tiago...");
        u = await prisma.user.create({
            data: {
                email,
                name: 'Tiago',
                manualRank: 'Commander',
                experience: 2500,
                grit: 850,
                totalSponsorship: 650,
                bio: "Mastermind Architect & Guardian",
                goals: {
                    create: [
                        {
                            vision: "Launch Lapis Platform Beta",
                            reality: "Core features in development",
                            options: "Hire dev team or Solo Code",
                            will: "Sprint for 2 weeks",
                            status: "ACTIVE",
                            okrs: {
                                create: [
                                    { metricName: "Active Users", targetValue: 100, currentValue: 12 },
                                    { metricName: "Feedback Score", targetValue: 9.0, currentValue: 8.5 }
                                ]
                            }
                        }
                    ]
                }
            }
        });
    }

    // 2. Create Fictional Users for "Public Mastermimnd"
    const demoUsers = [
        { name: "Alice", email: "alice@lapis.com", role: "Guardian" },
        { name: "Bob", email: "bob@lapis.com", role: "Ranger" },
        { name: "Charlie", email: "charlie@lapis.com", role: "Scout" }
    ];

    console.log("Creating Demo Users...");
    for (const d of demoUsers) {
        const exist = await prisma.user.findUnique({ where: { email: d.email } });
        if (!exist) {
            await prisma.user.create({
                data: {
                    name: d.name,
                    email: d.email,
                    manualRank: d.role,
                    goals: {
                        create: [
                            {
                                vision: `${d.name}'s Big Vision`,
                                reality: "Just starting out",
                                will: "Commit to weekly calls",
                                okrs: {
                                    create: { metricName: "Revenue", targetValue: 5000, currentValue: 1200 }
                                }
                            }
                        ]
                    }
                }
            });
            console.log(`Created ${d.name}`);
        }
    }

    console.log('Seed Complete. Main user:', u.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
