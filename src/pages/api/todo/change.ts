import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  if (req.method === "POST") {
    const updateCompleted = await prisma.todo.update({
      where: {
        id: req.body.id,
      },
      data: {
        completed: req.body.completed,
      },
    });

    console.log(updateCompleted);
    res.status(200).json({ submitted: updateCompleted });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
