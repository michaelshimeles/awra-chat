import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function fetchUserInfo(email: string | undefined) {
  return axios
    .get(`${process.env.NEXT_PUBLIC_URL}/api/getUserInfo`, {
      params: {
        email,
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

export const useGetUserInfo = (email: string | undefined) => {
  return useQuery({
    queryKey: ["user-info"],
    queryFn: () => fetchUserInfo(email),
  });
};
