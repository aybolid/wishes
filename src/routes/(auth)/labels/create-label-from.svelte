<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import Button from "$lib/components/ui/button.svelte";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import type { ActionData } from "./$types";

  type Props = {
    onCreate?: () => void;
  };
  const { onCreate = () => {} }: Props = $props();

  const form = $derived<ActionData>(page.form);
  const createErrorMap = $derived(form?.createLabel?.errorMap);

  let isCreatingLabel = $state(false);
</script>

<form
  class="grid gap-2"
  method="post"
  action="?/createLabel"
  use:enhance={() => {
    isCreatingLabel = true;
    return ({ update, result }) => {
      isCreatingLabel = false;
      if (result.type === "success") {
        onCreate();
      }
      update();
    };
  }}
>
  <Label required for="labelName">Name</Label>
  <Input placeholder="Label name" id="labelName" name="labelName" required />
  <ErrorMessage>{createErrorMap?.labelName}</ErrorMessage>

  <Label for="description">Description</Label>
  <Textarea name="description" id="description" placeholder="Label description" />
  <ErrorMessage>{createErrorMap?.description}</ErrorMessage>

  <ErrorMessage>{createErrorMap?.root}</ErrorMessage>

  <Button isLoading={isCreatingLabel} class="mt-4 w-full">Add</Button>
</form>
