<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import { Gift, Trash } from "lucide-svelte";
  import type { PageProps } from "./$types";
  import Select from "$lib/components/ui/select.svelte";
  import LabelTag from "$lib/components/common/label-tag.svelte";
  import Switch from "$lib/components/ui/switch.svelte";
  import { enhance } from "$app/forms";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";

  const { data, form }: PageProps = $props();

  const errorMap = $derived(form?.createWish?.errorMap);

  let selectedMetadataIds = $state<string[]>();

  const selectedMetadataFields = $derived(
    selectedMetadataIds?.map(
      (id) => data.metadata.find((meta) => meta.fieldId.toString() === id)!,
    ) ?? [],
  );

  let isCreating = $state(false);
</script>

<svelte:head>
  <title>Wishes | Create wish</title>
</svelte:head>

<h1 class="flex items-center gap-2 text-lg font-semibold">
  Create Wish
  <Gift />
</h1>

<form
  class="mt-4 grid gap-3"
  method="post"
  use:enhance={() => {
    isCreating = true;
    return ({ update }) => {
      isCreating = false;
      update();
    };
  }}
>
  <Label for="wishName" required>Name</Label>
  <Input id="wishName" name="wishName" placeholder="Wish name" required />
  <ErrorMessage>{errorMap?.wishName}</ErrorMessage>

  <Label for="url" required>URL</Label>
  <Input id="url" name="url" placeholder="https://my-wish.com" required />
  <ErrorMessage>{errorMap?.url}</ErrorMessage>

  <Label for="description">Description</Label>
  <Textarea id="description" name="description" placeholder="Some description" />
  <ErrorMessage>{errorMap?.description}</ErrorMessage>

  <Label class="mt-4" for="labels">Labels</Label>
  <Select
    id="labels"
    type="multiple"
    name="labels"
    items={data.labels.map((label) => ({ value: label.labelId.toString(), label: label.name }))}
  >
    {#snippet itemRender({ item })}
      <LabelTag
        label={{ creatorId: "", description: "", labelId: parseInt(item.value), name: item.label }}
      />
    {/snippet}
  </Select>
  <ErrorMessage>{errorMap?.labels}</ErrorMessage>

  <Label for="metadata">Metadata</Label>
  <Select
    bind:value={selectedMetadataIds}
    id="metadata"
    type="multiple"
    items={data.metadata.map((meta) => ({ value: meta.fieldId.toString(), label: meta.name }))}
  />

  {#if (selectedMetadataIds?.length ?? 0) > 0}
    <section class="bg-muted/20 grid gap-3 rounded-sm border p-4">
      {#each selectedMetadataFields as field}
        {@const id = `meta_${field.fieldId}`}
        <div class="flex items-center justify-between gap-2">
          {#if field.config.type !== "boolean"}
            <Label for={id} required>{field.name}</Label>
          {:else}
            <span></span>
          {/if}
          <span class="text-primary text-xs uppercase">{field.config.type}</span>
        </div>
        <div class="flex items-center gap-2">
          {#if field.config.type === "option"}
            <Select
              name={id}
              {id}
              items={field.config.options.map((option) => ({ value: option, label: option }))}
            />
          {:else if field.config.type === "text"}
            <Input name={id} {id} required class="w-full" />
          {:else if field.config.type === "number"}
            <Input name={id} {id} required class="w-full" type="number" />
          {:else if field.config.type === "boolean"}
            <Switch label={field.name} {id} name={id} />
          {/if}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            class="ml-auto"
            onclick={() =>
              (selectedMetadataIds = selectedMetadataIds?.filter(
                (id) => id !== field.fieldId.toString(),
              ))}
          >
            <Trash />
          </Button>
        </div>
        <ErrorMessage>{errorMap?.[id]}</ErrorMessage>
      {/each}
    </section>
  {/if}

  <Button type="submit" class="mt-4 ml-auto w-fit" isLoading={isCreating}>Create Wish</Button>
</form>
