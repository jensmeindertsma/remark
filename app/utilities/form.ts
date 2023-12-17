export function getFields<T extends string[]>(
  formData: FormData,
  fields: T
): T {
  return fields.map((field) => {
    const value = formData.get(field);

    if (!value || typeof value !== "string") {
      return "";
    } else {
      return value;
    }
  }) as T;
}
