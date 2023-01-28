import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import { v4 as uuidv4 } from "uuid";

export const UUID_KEY = "/uuid";
export const NICKNAME_KEY = "/nickname";

const useAuth = () => {
  const { data: uuid } = useSWR<string>(UUID_KEY);
  const { data: nickname } = useSWR<string>(NICKNAME_KEY);

  const router = useRouter();
  useEffect(() => {
    if (!uuid || !nickname) {
      void router.replace("/");
    }
  }, [uuid, nickname]);

  const generateUser = (nickname: string) => {
    const newUUID = uuidv4();
    void mutate(UUID_KEY, newUUID);
    void mutate(NICKNAME_KEY, nickname);
  };
  const resetUser = () => {
    void mutate(UUID_KEY, null);
    void mutate(NICKNAME_KEY, null);
  };
  const retryUser = () => {
    const newUUID = uuidv4();
    void mutate(UUID_KEY, newUUID);
  };

  return {
    uuid,
    nickname,
    generateUser,
    resetUser,
    retryUser,
  };
};
export default useAuth;
