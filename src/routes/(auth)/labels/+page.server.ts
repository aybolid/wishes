import type { Actions } from "./$types";
import { formDataToObject } from "$lib/utils/forms";
import { z } from "zod/v4";
import { fail } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";

const createLabelSchema = z.object({
  labelName: z.string().trim().min(1, "Required").max(31, "Must be 31 characters or less"),
  description: z.string().trim().max(255, "Must be 255 characters or less").default(""),
});

export const actions: Actions = {
  createLabel: async (event) => {
    const user = requireAuthenticatedUser();

    const formData = await event.request.formData();
    const dataObject = formDataToObject(formData);

    const { data, error, success } = createLabelSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});
      return fail(400, { createLabel: { errorMap } });
    }

    console.log(data, user);
  },
};
