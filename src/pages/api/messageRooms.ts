import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  });

  const { data: messages, error } = await supabase.from("messages").select();

  if (messages) {
    const chats = messages.map((room) => {
      if (room?.group_users_id.includes(req.query?.user_id))
        return room;
    });

    res.status(200).json(chats);
  }
  if (error) {
    console.log("Error", error);
    res.status(400).json(error);
  }
};
