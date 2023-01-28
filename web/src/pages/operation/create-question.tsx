import { api } from "../../utils/api";

const CreateQuestion = () => {
  const mutation = api.question.postQuestion.useMutation();
  // create a form with url
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
        <input type="text" name="url" className="border-4" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreateQuestion;
