<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import type { ActionData } from "./$types";

  const { form }: { form: ActionData } = $props();
  const usernameError = $derived(form?.errorMap?.username);
  const passwordError = $derived(form?.errorMap?.password);
  const rootError = $derived(form?.message);
</script>

<main class="grid h-full place-items-center">
  <form method="post" class="grid gap-2 rounded-sm border p-6" use:enhance>
    <label for="username">Username</label>
    <Input
      hasError={!!usernameError || !!rootError}
      type="text"
      name="username"
      required
      placeholder="johnpork13"
    />
    {#if usernameError}
      <p class="text-destructive text-sm">{usernameError}</p>
    {/if}

    <label for="password">Password</label>
    <Input
      hasError={!!passwordError || !!rootError}
      type="password"
      name="password"
      required
      placeholder="mysecret"
    />
    {#if passwordError}
      <p class="text-destructive text-sm">{passwordError}</p>
    {/if}

    {#if rootError}
      <p class="text-destructive text-sm">{rootError}</p>
    {/if}

    <Button type="submit" class="mt-4 ml-auto">Login</Button>
  </form>
</main>
