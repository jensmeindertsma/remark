export function formatTitle(name: string | null) {
  if (typeof name === "string") {
    return `${name} - Remark`;
  } else return "Remark";
}
