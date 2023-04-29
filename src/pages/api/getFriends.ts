import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  });

  const { data: friendData, error } = await supabase
    .from("friends")
    .select("friends")
    .eq("user_id", req.query?.user_id);

  let friendsArr: Array<object> = [];

  const friendsId = friendData?.[0]?.friends;

  if (friendData) {
    await Promise.all(
      friendsId?.map(async (id: string) => {
        const { data: friendsList, error } = await supabase
          .from("profile")
          .select()
          .eq("user_id", id);

        if (error) {
          console.log(error);
          return error;
        }

        if (friendsList) {
          friendsArr?.push(friendsList[0]);
        }
      })
    );

    const sortedFriends = friendsArr.sort((a: any, b: any) => {
      const usernameA = a?.username.toLowerCase();
      const usernameB = b?.username.toLowerCase();
      if (usernameA < usernameB) return -1;
      if (usernameA > usernameB) return 1;
      return 0;
    });

    return res.status(200).json(sortedFriends);
  }

  if (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};
