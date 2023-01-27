import axios from "axios";

export class TranslationService {
  private instance = axios.create({
    baseURL: "https://openapi.naver.com",
  });

  async enToKr(en: string): Promise<string> {
    const { data } = await this.instance.post(
      "/v1/papago/n2mt",
      `source=en&target=ko&text=${en}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Naver-Client-Id": "0ORpsoEpzmUBFto8osQy",
          "X-Naver-Client-Secret": "J0wJ5ok4f3",
        },
      }
    );
    return data.message.result.translatedText;
  }
}
