<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import type { Label as LabelType } from "$lib/server/db/schema";
  import { Edit, Plus, Trash } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import Label from "$lib/components/ui/label.svelte";
  import ConfirmPopover from "$lib/components/ui/confirm-popover.svelte";

  const { form, data }: { form: ActionData; data: PageServerData } = $props();

  const labels = $derived(data?.labels);

  const createErrorMap = $derived(form?.createLabel?.errorMap);
  let updateErrorMap = $derived(form?.updateLabel?.errorMap);
  const deleteErrorMap = $derived(form?.deleteLabel?.errorMap);

  let isCreateDrawerOpen = $state(false);
  let isCreatingLabel = $state(false);

  let isEditDrawerOpen = $state(false);
  let labelToEdit = $state<LabelType | undefined>();
  let isUpdatingLabel = $state(false);
  let editFormElement: HTMLFormElement | undefined = $state();

  $effect(() => {
    if (!deleteErrorMap?.root) return;
    toast.error("Failed to delete label", { description: deleteErrorMap.root });
  });

  function closeEditLabelDrawer() {
    isEditDrawerOpen = false;
    editFormElement?.reset();
    updateErrorMap = undefined;
  }
</script>

<div class="flex w-full items-center justify-end">
  <Button onclick={() => (isCreateDrawerOpen = true)}>
    <Plus />
    Add Label
  </Button>
</div>

{#if data.labels.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No labels yet</p>
{/if}

<section class="mt-4 grid gap-4 sm:grid-cols-2">
  {#each labels as label}
    {@const isUserCreator = label.creatorId === data.user.userId}
    <div class="flex flex-col gap-2 rounded-sm border p-3">
      <div>
        <Label {label} />
      </div>
      <p class="text-muted-foreground flex-1">{label.description}</p>
      {#if isUserCreator}
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
          <ConfirmPopover
            title={`Delete "${label.name}" Label`}
            message="Are you sure you want to delete this label?"
            confirmText="Delete"
            confirmForm={{
              method: "post",
              action: "?/deleteLabel",
              enhance: ({ formData }) => {
                formData.set("labelId", label.labelId.toString());
                return ({ update }) => {
                  update();
                };
              },
            }}
          >
            <Button type="button" title="Delete" size="icon" variant="destructive">
              <Trash size={16} />
            </Button>
          </ConfirmPopover>
        </div>
      {/if}
    </div>
  {/each}
</section>

<Drawer isOpen={isCreateDrawerOpen} onClose={() => (isCreateDrawerOpen = false)} title="Add Label">
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
      forceError={!!createErrorMap?.root}
      error={createErrorMap?.labelName}
      label="Name"
      placeholder="Label name"
      name="labelName"
      required
    />
    <Textarea
      forceError={!!createErrorMap?.root}
      error={createErrorMap?.description}
      label="Description"
      name="description"
      placeholder="Label description"
    />

    {#if createErrorMap?.root}
      <p class="text-destructive text-sm">{createErrorMap.root}</p>
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
      error={updateErrorMap?.labelName}
      forceError={!!updateErrorMap?.root}
      label="Name"
      placeholder="Label name"
      name="labelName"
      required
      defaultValue={labelToEdit?.name ?? ""}
    />
    <Textarea
      error={updateErrorMap?.description}
      forceError={!!updateErrorMap?.root}
      label="Description"
      name="description"
      placeholder="Label description"
      defaultValue={labelToEdit?.description ?? ""}
    />

    {#if updateErrorMap?.root}
      <p class="text-destructive text-sm">{updateErrorMap.root}</p>
    {/if}

    <Button isLoading={isUpdatingLabel} class="mt-4 w-full">Update</Button>
  </form>
</Drawer>
