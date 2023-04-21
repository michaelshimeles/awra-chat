import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  try {
    const showTodoList = await prisma.todo.findMany({});

    res.status(200).json(showTodoList);
  } catch (error) {
    res.status(404).json({ error: error });
  }
}
