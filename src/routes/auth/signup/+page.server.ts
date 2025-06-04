import { formDataToObject } from "$lib/utils/forms";
import { fail, redirect } from "@sveltejs/kit";
import { safeParse, z } from "zod/v4";
import type { Actions } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import * as schema from "$lib/server/db/schema";
import { hash } from "@node-rs/argon2";
import * as auth from "$lib/server/auth";
import { encodeBase32LowerCase } from "@oslojs/encoding";

const signupSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(31)
    .regex(/^[a-z0-9_-]+$/),
  password: z.string().min(6).max(255),
});

export const actions: Actions = {
  default: async (e) => {
    const formData = await e.request.formData();
    const dataObject = formDataToObject(formData);

    const { success, data, error } = safeParse(signupSchema, dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});
      return fail(400, { errorMap });
    }

    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.username, data.username),
      });
      if (existingUser !== undefined) {
        return fail(400, { message: "User already exists" });
      }

      const passwordHash = await hash(data.password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      const userId = generateUserId();
      await db.insert(schema.users).values({ username: data.username, userId, passwordHash });

      const sessionToken = auth.generateSessionToken();
      const session = await auth.createSession(sessionToken, userId);
      auth.setSessionTokenCookie(e, sessionToken, session.expiresAt);
    } catch (error) {
      console.error(error);
      return fail(500, { message: "Something went wrong" });
    }

    return redirect(302, "/");
  },
};

function generateUserId() {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  const id = encodeBase32LowerCase(bytes);
  return id;
}
