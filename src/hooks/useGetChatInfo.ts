import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function fetchChatInfo(roomId: string) {
  return axios
    .get(`${process.env.NEXT_PUBLIC_URL}/api/getChatInfo`, {
      params: {
        roomId,
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

export const useGetChatInfo = (roomId: string) => {
  return useQuery({
    queryKey: ["get-chat-info"],
    queryFn: () => fetchChatInfo(roomId),
  });
};
