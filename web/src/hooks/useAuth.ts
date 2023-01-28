import useSWR, { mutate } from "swr";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import { useRouter } from "next/router";

export const UUID_KEY = "/uuid";
export const NICKNAME_KEY = "/nickname";

const useAuth = () => {
  const { data: uuid } = useSWR(UUID_KEY);
  const { data: nickname } = useSWR(NICKNAME_KEY);

  const router = useRouter();
  useEffect(() => {
    if (!uuid) {
      router.replace("/");
    }
  }, [uuid]);

  const generateUser = (nickname: string) => {
    const newUUID = uuidv4();
    mutate(UUID_KEY, newUUID);
    mutate(NICKNAME_KEY, nickname);
  };
  const resetUser = () => {
    mutate(UUID_KEY, null);
    mutate(NICKNAME_KEY, null);
  };

  return {
    uuid,
    nickname,
    generateUser,
    resetUser,
  };
};
export default useAuth;
