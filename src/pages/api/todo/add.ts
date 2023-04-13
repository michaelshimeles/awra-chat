import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  if (req.method === "POST") {
    const addTodoList = await prisma.todo.create({
      data: {
        task: req.body,
        completed: false,
      },
    });
    res.status(200).json({ submitted: addTodoList });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
