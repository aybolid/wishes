<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import type { ActionData } from "./$types";

  const { form }: { form: ActionData } = $props();
  const usernameError = $derived(form?.errorMap?.username);
  const passwordError = $derived(form?.errorMap?.password);
  const passwordConfirmationError = $derived(form?.errorMap?.passwordConfirmation);
  const rootError = $derived(form?.message);

  let isSubmitting = $state(false);
</script>

<main class="grid h-full place-items-center">
  <form
    method="post"
    class="grid w-full max-w-sm gap-2 rounded-sm border p-6"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ update }) => {
        isSubmitting = false;
        update();
      };
    }}
  >
    <h1 class="mb-4 text-lg font-semibold">Signup</h1>

    <Input
      label="Username"
      forceError={!!rootError}
      error={usernameError}
      type="text"
      name="username"
      required
      placeholder="johnpork13"
    />
    <Input
      label="Password"
      forceError={!!rootError}
      error={passwordError}
      type="password"
      name="password"
      required
      placeholder="mysecret"
    />
    <Input
      label="Password confirmation"
      forceError={!!rootError}
      error={passwordConfirmationError}
      type="password"
      name="passwordConfirmation"
      required
      placeholder="mysecret"
    />

    {#if rootError}
      <p class="text-destructive text-sm">{rootError}</p>
    {/if}

    <Button isLoading={isSubmitting} type="submit" class="mt-6 w-full">Signup</Button>

    <a href="/auth/login" class="text-muted-foreground mt-4 text-center text-sm hover:underline">
      Already have an account? Login
    </a>
  </form>
</main>
