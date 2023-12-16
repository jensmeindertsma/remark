import { ZodError } from "zod";

export type Feedback<T> = {
  [K in keyof T]: { value: string; error: string | undefined };
};

export function formatFeedback<T extends { [K in keyof T]: string }>(
  rawData: T,
  parseError: ZodError<T>
): Feedback<T> {
  const fieldErrors = parseError.flatten().fieldErrors;
  return (Object.entries(rawData) as Array<[keyof T, string]>).reduce(
    (feedback, [key, value]) => {
      feedback[key] = {
        value,
        error: fieldErrors[key]?.at(0),
      };
      return feedback;
    },
    {} as Feedback<T>
  );
}
