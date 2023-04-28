import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function fetchMessageRooms(user_id: string) {
  return axios
    .get(`${process.env.NEXT_PUBLIC_URL}/api/messageRooms`, {
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

export const useGetMessageRoom = (user_id: string) => {
  return useQuery({
    queryKey: ["message-rooms"],
    queryFn: () => fetchMessageRooms(user_id),
  });
};
