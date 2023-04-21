import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  if (req.method === "POST") {
    const deleteTodoList = await prisma.todo.deleteMany({
      where: {
        id: {
          equals: req.body.id,
        },
      },
    });

    res.status(200).json({ Deleted: deleteTodoList });
  }
  res.status(405).json({ error: "Method not allowed" });
}
