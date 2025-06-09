<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import { Plus, Trash } from "lucide-svelte";
  import type { ActionData } from "./$types";

  type Props = {
    form: ActionData;
    isOpen: boolean;
  };

  let { form, isOpen = $bindable() }: Props = $props();

  const createErrorMap = $derived(form?.createMetadata?.errorMap);

  let isCreatingField = $state(false);

  let selectedType = $state<string>();
  let optionNameInputElement: HTMLInputElement | undefined = $state();
  let addedOptions = $state<string[]>([]);
</script>

<Drawer {isOpen} onClose={() => (isOpen = false)} title="Add Metadata">
  <form
    class="grid gap-2"
    method="post"
    action="?/createMetadata"
    use:enhance={({ formData }) => {
      if (addedOptions.length > 0) {
        for (const option of addedOptions) {
          formData.append("options", option);
        }
      }
      isCreatingField = true;
      return ({ update }) => {
        isCreatingField = false;
        update();
      };
    }}
  >
    <Label for="fieldName" required>Name</Label>
    <Input placeholder="Field name" name="fieldName" id="fieldName" required />
    <ErrorMessage>{createErrorMap?.fieldName}</ErrorMessage>

    <Label for="description">Description</Label>
    <Textarea id="description" name="description" placeholder="Field description" />
    <ErrorMessage>{createErrorMap?.description}</ErrorMessage>

    <Label for="type" required>Type</Label>
    <Select
      bind:value={selectedType}
      required
      id="type"
      name="type"
      items={[
        { value: "text", label: "Text" },
        { value: "boolean", label: "Boolean" },
        { value: "option", label: "Option" },
        { value: "number", label: "Number" },
      ]}
    />
    <ErrorMessage>{createErrorMap?.type}</ErrorMessage>

    {#if selectedType === "option"}
      <Label for="options" required>Options</Label>
      <div class="flex items-center gap-2">
        <Input
          bind:element={optionNameInputElement}
          placeholder="Option name"
          class="flex-1"
          id="options"
        />
        <Button
          variant="outline"
          type="button"
          size="sm"
          onclick={() => {
            if (!optionNameInputElement) return;
            const optionName = optionNameInputElement.value.trim();
            if (!optionName) return;
            if (addedOptions.includes(optionName)) return;
            optionNameInputElement.value = "";
            addedOptions = [...addedOptions, optionName];
          }}
        >
          <Plus />
        </Button>
      </div>

      <ErrorMessage>{createErrorMap?.options}</ErrorMessage>

      <ul class="flex flex-col gap-2">
        {#each addedOptions as option, i (i + option)}
          <li class="flex items-center justify-between gap-2 border-b pb-1">
            {option}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onclick={() => (addedOptions = addedOptions.filter((o) => o !== option))}
            >
              <Trash class="text-destructive" />
            </Button>
          </li>
        {/each}
      </ul>
    {/if}

    <ErrorMessage>{createErrorMap?.root}</ErrorMessage>

    <Button isLoading={isCreatingField} class="mt-4 w-full">Add</Button>
  </form>
</Drawer>
