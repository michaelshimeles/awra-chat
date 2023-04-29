import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function fetchFriendRequests(user_id: string) {
  return axios
    .get(`${process.env.NEXT_PUBLIC_URL}/api/getFriendRequests`, {
      params: {
        user_id,
      },
    })
    .then((result) => {
      return result?.data;
    })
    .catch((error) => {
      console.log("Error", error);
      throw error;
    });
}

export const useGetFriendRequest = (user_id: string) => {
  return useQuery({
    queryKey: ["get-friend-requests"],
    queryFn: () => fetchFriendRequests(user_id),
  });
};
