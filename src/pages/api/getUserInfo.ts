import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  });

  const { data: profile, error } = await supabase
    .from("profile")
    .select("*")
    .eq("email", req.query?.email);

  if (profile) {
    return res.status(200).json(profile);
  }

  if (error) {
    return res.status(400).json(error);
  }
};
