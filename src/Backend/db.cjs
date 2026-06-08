const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const databasePath = process.env.DATABASE_PATH || path.join(__dirname, 'prisma', 'auth.db');
const adapter = new PrismaBetterSqlite3({ url: databasePath });
const prisma = new PrismaClient({ adapter });

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Havi';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'havi6';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

const initDatabase = async () => {
  const adminPassword = ADMIN_PASSWORD_HASH || await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: {
      username: ADMIN_USERNAME,
      password: adminPassword
    }
  });
};

const findUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username }
  });
};

const createUser = async ({ username, password }) => {
  return prisma.user.create({
    data: {
      username,
      password
    }
  });
};

const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

module.exports = {
  prisma,
  initDatabase,
  disconnectDatabase,
  findUserByUsername,
  createUser
};
