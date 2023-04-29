import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  });

  const { data: chatInfo, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", req.query?.roomId);

  if (chatInfo) {
    return res.status(200).json(chatInfo);
  }

  if (error) {
    return res.status(400).json(error);
  }
};
