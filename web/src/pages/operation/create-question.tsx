import Image from "next/image";
import { useState } from "react";
import { api } from "../../utils/api";

const CreateQuestion = () => {
  // create a form with url
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const mutation = api.question.postQuestion.useMutation({
    onSuccess: (data) => {
      setResult(JSON.stringify(data, null, 2));
    },
  });

  return (
    <div>
      <h1>Create Question</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          mutation.mutate({
            url: formData.get("url") as string,
          });
          // do not reload page
          return false;
        }}
      >
        <input
          type="text"
          name="url"
          className="border-4"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (result) {
              setResult("");
            }
          }}
        />
        <button type="submit">Submit</button>
      </form>
      <div className="flex">
        <div>
          <div>Result:</div>
          <div className="whitespace-pre-wrap">
            {mutation.isLoading ? "Loading..." : result}
          </div>
        </div>
        <Image
          src={url}
          alt="Picture of the author"
          width={500}
          height={1000}
        />
      </div>
    </div>
  );
};

export default CreateQuestion;
