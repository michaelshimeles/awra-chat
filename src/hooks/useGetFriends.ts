import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function fetchFriends(user_id: string) {
  return axios
    .get(`${process.env.NEXT_PUBLIC_URL}/api/getFriends`, {
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

export const useGetFriends = (user_id: string) => {
  return useQuery({
    queryKey: ["get-friends"],
    queryFn: () => fetchFriends(user_id),
  });
};
