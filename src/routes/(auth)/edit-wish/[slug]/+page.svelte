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
  import Popover from "$lib/components/ui/popover.svelte";
  import { toast } from "svelte-sonner";

  const { data, form }: PageProps = $props();

  const labels = $derived(data.wish.wishesToLabels.map(({ label }) => label));

  const errorMap = $derived(form?.updateWish?.errorMap);

  $effect(() => {
    if (form?.deleteWish?.errorMap.root) {
      toast.error("Failed to delete wish", { description: form.deleteWish.errorMap.root });
    }
  });

  let selectedMetadataIds = $state<string[]>(
    data.wish.metadataValues.map(({ metadataFieldId }) => metadataFieldId.toString()),
  );

  const metadataValues = $derived(
    data.wish.metadataValues.reduce<Record<number, string>>((acc, curr) => {
      acc[curr.metadataFieldId] = curr.value;
      return acc;
    }, {}),
  );

  const selectedMetadataFields = $derived(
    selectedMetadataIds?.map(
      (id) => data.metadata.find((meta) => meta.fieldId.toString() === id)!,
    ) ?? [],
  );

  let isUpdating = $state(false);
</script>

<h1 class="flex items-center gap-2 text-lg font-semibold">
  Edit Wish
  <Gift />
</h1>

<form
  class="mt-4 grid gap-3"
  method="post"
  action="?/updateWish"
  use:enhance={({ formData }) => {
    isUpdating = true;
    formData.set("wishId", data.wish.wishId.toString());

    return ({ update }) => {
      isUpdating = false;
      update();
    };
  }}
>
  <Label for="wishName" required>Name</Label>
  <Input
    id="wishName"
    name="wishName"
    placeholder="Wish name"
    required
    defaultValue={data.wish.name}
  />
  <ErrorMessage>{errorMap?.wishName}</ErrorMessage>

  <Label for="url" required>URL</Label>
  <Input
    id="url"
    name="url"
    placeholder="https://my-wish.com"
    required
    defaultValue={data.wish.url}
  />
  <ErrorMessage>{errorMap?.url}</ErrorMessage>

  <Label for="description">Description</Label>
  <Textarea
    id="description"
    name="description"
    placeholder="Some description"
    defaultValue={data.wish.description}
  />
  <ErrorMessage>{errorMap?.description}</ErrorMessage>

  <Label class="mt-4" for="labels">Labels</Label>
  <Select
    value={labels.map(({ labelId }) => labelId.toString())}
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
              value={metadataValues[field.fieldId]}
            />
          {:else if field.config.type === "text"}
            <Input
              name={id}
              {id}
              required
              class="w-full"
              defaultValue={metadataValues[field.fieldId]}
            />
          {:else if field.config.type === "number"}
            <Input
              name={id}
              {id}
              required
              class="w-full"
              type="number"
              value={metadataValues[field.fieldId]}
            />
          {:else if field.config.type === "boolean"}
            <Switch
              label={field.name}
              {id}
              name={id}
              checked={metadataValues[field.fieldId] === "true"}
            />
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

  <Button type="submit" class="mt-4 ml-auto w-fit" isLoading={isUpdating}>Update Wish</Button>
</form>

<h3 class="text-destructive mt-4 text-lg font-semibold">Danger Zone</h3>
<div class="border-destructive mt-2 w-full rounded-sm border border-dashed p-3">
  <Popover>
    {#snippet trigger({ props })}
      <Button variant="destructive" {...props}>Delete Wish</Button>
    {/snippet}
    <h3 class="font-semibold">Delete wish</h3>
    <p class="text-muted-foreground mt-1 mb-3 text-sm">
      Are you sure you want to delete this wish?
    </p>
    <form
      class="ml-auto w-fit"
      method="post"
      action="?/deleteWish"
      use:enhance={({ formData }) => {
        formData.set("wishId", data.wish.wishId.toString());
        return ({ update }) => {
          update();
        };
      }}
    >
      <Button type="submit" size="sm" variant="destructive">
        <Trash />
        Delete
      </Button>
    </form>
  </Popover>
</div>
