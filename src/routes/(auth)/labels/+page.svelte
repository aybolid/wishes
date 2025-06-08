<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import type { Label } from "$lib/server/db/schema";
  import { Edit, Plus, Trash } from "lucide-svelte";

  let isDrawerOpen = $state(false);
  let isCreatingLabel = $state(false);

  let isEditDrawerOpen = $state(false);
  let labelToEdit = $state<Label | undefined>();
  let isUpdatingLabel = $state(false);

  const { form, data }: { form: ActionData; data: PageServerData } = $props();

  const labels = $derived(data?.labels);

  const createLabelNameError = $derived(form?.createLabel?.errorMap?.labelName);
  const createDescriptionError = $derived(form?.createLabel?.errorMap?.description);
  const createRootError = $derived(form?.createLabel?.errorMap?.root);

  let updateLabelNameError = $derived(form?.updateLabel?.errorMap?.labelName);
  let updateDescriptionError = $derived(form?.updateLabel?.errorMap?.description);
  let updateRootError = $derived(form?.updateLabel?.errorMap?.root);

  let editFormElement: HTMLFormElement | undefined = $state();

  function closeEditLabelDrawer() {
    isEditDrawerOpen = false;
    editFormElement?.reset();
    updateDescriptionError = undefined;
    updateLabelNameError = undefined;
    updateRootError = undefined;
  }
</script>

<div class="flex w-full items-center justify-end">
  <Button onclick={() => (isDrawerOpen = true)}>
    <Plus />
    Add Label
  </Button>
</div>

<section class="mt-4 grid gap-4">
  {#if data.labels.length === 0}
    <p class="text-muted-foreground text-center">No labels yet</p>
  {/if}
  {#each labels as label}
    {@const isCurrentUser = label.creatorId === data.user.userId}
    <div class="flex flex-col gap-2 rounded-sm border p-3">
      <div>{label.name}</div>
      <p class="text-muted-foreground">{label.description}</p>
      {#if isCurrentUser}
        <div class="flex items-center justify-end gap-2">
          <Button
            title="Edit"
            size="icon"
            variant="secondary"
            onclick={() => {
              labelToEdit = label;
              isEditDrawerOpen = true;
            }}
          >
            <Edit size={16} />
          </Button>
          <form
            method="post"
            action="?/deleteLabel"
            use:enhance={({ formData }) => {
              formData.set("labelId", label.labelId.toString());
              return ({ update }) => {
                update();
              };
            }}
          >
            <Button type="submit" title="Delete" size="icon" variant="destructive">
              <Trash size={16} />
            </Button>
          </form>
        </div>
      {/if}
    </div>
  {/each}
</section>

<Drawer isOpen={isDrawerOpen} onClose={() => (isDrawerOpen = false)} title="Add Label">
  <form
    class="grid gap-2"
    method="post"
    action="?/createLabel"
    use:enhance={() => {
      isCreatingLabel = true;
      return ({ update }) => {
        isCreatingLabel = false;
        update();
      };
    }}
  >
    <Input
      forceError={!!createRootError}
      error={createLabelNameError}
      label="Name"
      placeholder="Label name"
      name="labelName"
      required
    />
    <Textarea
      forceError={!!createRootError}
      error={createDescriptionError}
      label="Description"
      name="description"
      placeholder="Label description"
    />

    {#if createRootError}
      <p class="text-destructive text-sm">{createRootError}</p>
    {/if}

    <Button isLoading={isCreatingLabel} class="mt-4 w-full">Add</Button>
  </form>
</Drawer>

<Drawer
  isOpen={labelToEdit !== undefined && isEditDrawerOpen}
  onClose={closeEditLabelDrawer}
  title="Edit Label"
>
  <form
    bind:this={editFormElement}
    class="grid gap-2"
    method="post"
    action="?/updateLabel"
    use:enhance={({ formData }) => {
      if (!labelToEdit) return;

      formData.set("labelId", labelToEdit.labelId.toString());
      isUpdatingLabel = true;

      return ({ update }) => {
        isUpdatingLabel = false;
        closeEditLabelDrawer();
        update({ reset: false });
      };
    }}
  >
    <Input
      error={updateLabelNameError}
      forceError={!!updateRootError}
      label="Name"
      placeholder="Label name"
      name="labelName"
      required
      defaultValue={labelToEdit?.name ?? ""}
    />
    <Textarea
      error={updateDescriptionError}
      forceError={!!updateRootError}
      label="Description"
      name="description"
      placeholder="Label description"
      defaultValue={labelToEdit?.description ?? ""}
    />

    {#if updateRootError}
      <p class="text-destructive text-sm">{updateRootError}</p>
    {/if}

    <Button isLoading={isUpdatingLabel} class="mt-4 w-full">Update</Button>
  </form>
</Drawer>
