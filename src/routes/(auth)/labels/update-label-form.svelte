<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import type { LabelWithCreator } from "$lib/server/db/schema";

  type Props = {
    label: LabelWithCreator;
    onUpdate?: () => void;
    errorMap?: {
      labelName?: string;
      description?: string;
      root?: string;
    };
  };
  const { label, onUpdate = () => {}, errorMap }: Props = $props();

  let isUpdatingLabel = $state(false);
</script>

<form
  class="grid gap-2"
  method="post"
  action="?/updateLabel"
  use:enhance={({ formData }) => {
    formData.set("labelId", label.labelId.toString());
    isUpdatingLabel = true;

    return ({ update, result }) => {
      isUpdatingLabel = false;
      if (result.type === "success") {
        onUpdate();
      }
      update({ reset: false });
    };
  }}
>
  <Label required for="labelName">Name</Label>
  <Input
    placeholder="Label name"
    id="labelName"
    name="labelName"
    required
    defaultValue={label.name}
  />
  <ErrorMessage>{errorMap?.labelName}</ErrorMessage>

  <Label for="description">Description</Label>
  <Textarea
    name="description"
    id="description"
    placeholder="Label description"
    defaultValue={label.description}
  />
  <ErrorMessage>{errorMap?.description}</ErrorMessage>

  <ErrorMessage>{errorMap?.root}</ErrorMessage>

  <Button isLoading={isUpdatingLabel} class="mt-4 w-full">Update</Button>
</form>
