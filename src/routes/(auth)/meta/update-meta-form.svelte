<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import type { ActionData } from "./$types";
  import { page } from "$app/state";
  import type { MetadataFieldWithCreator } from "$lib/server/db/schema";

  type Props = {
    field: MetadataFieldWithCreator;
    onUpdate?: () => void;
  };
  const { field, onUpdate = () => {} }: Props = $props();

  const form = $derived<ActionData>(page.form);

  const errorMap = $derived(form?.updateMetadata?.errorMap);

  let isUpdating = $state(false);

  let selectedType = $state<string>(field.config.type);
  let addedOptions = $state<string[]>(field.config.type === "option" ? field.config.options : []);
</script>

<form
  class="grid gap-2"
  method="post"
  action="?/updateMetadata"
  use:enhance={({ formData }) => {
    formData.set("fieldId", field.fieldId.toString());
    isUpdating = true;
    return ({ update, result }) => {
      isUpdating = false;
      if (result.type === "success") {
        onUpdate();
      }
      update();
    };
  }}
>
  <Label for="fieldName" required>Name</Label>
  <Input
    placeholder="Field name"
    name="fieldName"
    id="fieldName"
    required
    defaultValue={field.name}
  />
  <ErrorMessage>{errorMap?.fieldName}</ErrorMessage>

  <Label for="description">Description</Label>
  <Textarea
    id="description"
    name="description"
    placeholder="Field description"
    defaultValue={field.description}
  />
  <ErrorMessage>{errorMap?.description}</ErrorMessage>

  <Label for="type">Type</Label>
  <Select
    bind:value={selectedType}
    required
    id="type"
    disabled
    items={[
      { value: "text", label: "Text" },
      { value: "boolean", label: "Boolean" },
      { value: "option", label: "Option" },
      { value: "number", label: "Number" },
    ]}
  />

  {#if selectedType === "option"}
    <ul class="flex flex-col gap-2 opacity-50">
      {#each addedOptions as option, i (i + option)}
        <li class="flex items-center justify-between gap-2 border-b pb-1">
          {option}
        </li>
      {/each}
    </ul>
  {/if}

  <ErrorMessage>{errorMap?.root}</ErrorMessage>

  <Button isLoading={isUpdating} class="mt-4 w-full">Update</Button>
</form>
