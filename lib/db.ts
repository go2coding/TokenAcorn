import { PrismaClient } from "./generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { getTursoConfig } from "./turso";

function createPrismaClient() {
  const adapter = new PrismaLibSql(getTursoConfig());
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
