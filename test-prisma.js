const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

console.log('Creating LibSQL client...');
const libsql = createClient({
    url: 'file:./dev.db',
});

console.log('Creating Prisma adapter...');
const adapter = new PrismaLibSQL(libsql);

console.log('Creating Prisma client with adapter...');
const prisma = new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
});

console.log('✅ Prisma client created successfully!');
console.log('Testing user model...');

prisma.user.findMany({ take: 1 })
    .then(users => {
        console.log('✅ Query successful! Found', users.length, 'users');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Query failed:', error.message);
        process.exit(1);
    });
