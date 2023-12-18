type Data = {
  title: string;
  progress: string;
};

export function validate({ title, progress }: Data) {
  let errors: { title?: string; progress?: string } = {};

  if (!title) {
    errors.title = "This field is required";
  }

  if (!progress) {
    errors.progress = "This field is required";
  }

  return Object.keys(errors).length ? errors : null;
}
