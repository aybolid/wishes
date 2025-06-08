import { formDataToObject } from "$lib/utils/forms";
import { z } from "zod/v4";
import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import * as schema from "$lib/server/db/schema";
import { verify } from "@node-rs/argon2";
import * as auth from "$lib/server/auth";

const loginSchema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const dataObject = formDataToObject(formData);

    const { success, data, error } = loginSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});
      return fail(400, { errorMap });
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, data.username),
    });

    if (!user) {
      return fail(400, { message: "Incorrect username or password" });
    }

    const isPasswordValid = await verify(user.passwordHash, data.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!isPasswordValid) {
      return fail(400, { message: "Incorrect username or password" });
    }

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, user.userId);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

    return redirect(302, "/");
  },
};
