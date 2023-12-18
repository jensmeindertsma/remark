import { prisma } from "~/utilities/database.server.ts";

export async function getRemarks(id: string) {
  return await prisma.remark.findMany({
    where: { accountId: id },
    orderBy: {
      edited: "desc",
    },
  });
}

type CreateData = {
  accountId: string;
  title: string;
  progress: string;
};

export async function createRemark({ accountId, title, progress }: CreateData) {
  await prisma.remark.create({
    data: {
      accountId,
      title,
      progress,
    },
  });
}

type UpdateData = {
  id: string;
  title: string;
  progress: string;
};

export async function updateRemark({ id, title, progress }: UpdateData) {
  await prisma.remark.update({
    where: { id },
    data: { title, progress, edited: new Date() },
  });
}

export async function deleteRemark(id: string) {
  await prisma.remark.delete({ where: { id } });
}
