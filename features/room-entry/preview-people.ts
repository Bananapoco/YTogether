export const previewPeople = {
  Alex: { color: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  Maya: { color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  Jordan: { color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
}

export type PreviewPerson = keyof typeof previewPeople
