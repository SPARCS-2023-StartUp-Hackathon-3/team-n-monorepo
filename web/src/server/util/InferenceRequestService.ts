import axios from "axios";
import { z } from "zod";
import { serverEnv } from "../../env/schema.mjs";

export class InferenceRequestService {
  private instance = axios.create({
    baseURL: serverEnv.INFERENCE_SERVER_BASE_URL,
  });

  async getMultiple(urls: string[]): Promise<
    {
      url: string;
      result: {
        model: string;
        result: string;
      }[];
    }[]
  > {
    const rawResponse = await this.instance
      .post<unknown>("/multiple", {
        urls,
      })
      .then((res) => res.data);

    const result = z
      .object({
        vit_gpt2: z.array(z.string()),
        git_base_coco: z.array(z.string()),
        blip_base: z.array(z.string()),
      })
      .parse(rawResponse);

    return urls.map((url, i) => ({
      url,
      result: [
        {
          model: "vit_gpt2",
          result: result.vit_gpt2[i] || "",
        },
        {
          model: "git_base_coco",
          result: result.git_base_coco[i] || "",
        },
        {
          model: "blip_base",
          result: result.blip_base[i] || "",
        },
      ],
    }));
  }
}
