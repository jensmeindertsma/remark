type Data = {
  title: string;
  progress: string;
};

export function validate({ title, progress }: Data) {
  let errors: { title?: string; progress?: string } = {};

  if (!title) {
    errors.title = "Please provide a title";
  }

  if (!progress) {
    errors.progress = "Please provide a description of your progress";
  }

  return Object.keys(errors).length ? errors : null;
}
