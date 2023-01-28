import axios from "axios";
import { z } from "zod";

export class TranslationService {
  private instance = axios.create({
    baseURL: "https://openapi.naver.com",
  });

  async enToKr(en: string): Promise<string> {
    const data = await this.instance
      .post<unknown>("/v1/papago/n2mt", `source=en&target=ko&text=${en}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Naver-Client-Id": "abdsZ4P4wfWxfwWwluf7",
          "X-Naver-Client-Secret": "emn1T4Bw4Z",
        },
      })
      .then((res) => res.data);
    const {
      message: {
        result: { translatedText },
      },
    } = z
      .object({
        message: z.object({
          result: z.object({
            translatedText: z.string(),
          }),
        }),
      })
      .parse(data);

    return translatedText;
  }
}
