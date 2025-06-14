<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import type { ActionData } from "./$types";

  const { form }: { form: ActionData } = $props();

  const signupErrorMap = $derived(form?.signup?.errorMap);

  let isSubmitting = $state(false);
</script>

<main class="grid h-full place-items-center p-4">
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

    <Label for="username" required>Username</Label>
    <Input name="username" id="username" required placeholder="johnpork13" />
    <ErrorMessage>{signupErrorMap?.username}</ErrorMessage>

    <Label for="password" required>Password</Label>
    <Input type="password" name="password" id="password" required placeholder="mysecret" />
    <ErrorMessage>{signupErrorMap?.password}</ErrorMessage>

    <Label for="passwordConfirmation" required>Password confirmation</Label>
    <Input
      type="password"
      name="passwordConfirmation"
      id="passwordConfirmation"
      required
      placeholder="mysecret"
    />
    <ErrorMessage>{signupErrorMap?.passwordConfirmation}</ErrorMessage>

    <ErrorMessage>{signupErrorMap?.root}</ErrorMessage>

    <Button isLoading={isSubmitting} type="submit" class="mt-6 w-full">Signup</Button>

    <a href="/login" class="text-muted-foreground mt-4 text-center text-sm hover:underline">
      Already have an account? Login
    </a>
  </form>
</main>
