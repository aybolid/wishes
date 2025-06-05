<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  const { form }: { form: ActionData } = $props();
</script>

<form method="post" class="grid gap-2" use:enhance>
  <label for="username">Username</label>
  <input type="text" name="username" required />
  <p>{form?.errorMap?.username}</p>
  <label for="password">Password</label>
  <input type="password" name="password" required />
  <p>{form?.errorMap?.password}</p>
  <p>{form?.message}</p>
  <button type="submit">Login</button>
</form>
