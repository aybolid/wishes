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
  import LabelTag from "$lib/components/ui/label-tag.svelte";
  import Avatar from "$lib/components/ui/avatar.svelte";
  import Popover from "$lib/components/ui/popover.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";

  const { form, data }: { form: ActionData; data: PageServerData } = $props();

  let showCreatedByCurrentUser = $state(false);

  const labels = $derived(
    !showCreatedByCurrentUser
      ? data.labels
      : data.labels.filter((label) => label.creatorId === data.user.userId),
  );

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

  function toggleShowCreatedByCurrentUser() {
    showCreatedByCurrentUser = !showCreatedByCurrentUser;
  }
</script>

<div class="flex w-full items-center justify-between">
  <Button onclick={toggleShowCreatedByCurrentUser} variant="outline" size="sm" class="w-40">
    {showCreatedByCurrentUser ? "Show All" : "Show Created By Me"}
  </Button>
  <Button onclick={() => (isCreateDrawerOpen = true)}>
    <Plus />
    Add Label
  </Button>
</div>

{#if labels.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No labels yet</p>
{/if}

<section class="mt-4 grid gap-4">
  {#each labels as label, i (i + label.labelId.toString())}
    {@const isUserCreator = label.creatorId === data.user.userId}
    <div class="flex flex-col gap-2 rounded-sm border p-3">
      <div class="flex items-center justify-between gap-2">
        <LabelTag {label} />
        <a href={`/user/${label.creator.userId}`} class="ml-auto inline-flex items-center gap-1">
          <Avatar username={label.creator.username} />
          <span class="-mt-1">
            {label.creator.username}
          </span>
        </a>
      </div>

      {#if label.description}
        <p class="text-muted-foreground mt-2 flex-1">{label.description}</p>
      {/if}

      {#if isUserCreator}
        <div class="mt-2 flex items-center justify-end gap-2">
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
          <Popover>
            {#snippet trigger({ props })}
              <Button {...props} type="button" title="Delete" size="icon" variant="destructive">
                <Trash size={16} />
              </Button>
            {/snippet}

            <h3 class="font-semibold">Delete label</h3>
            <p class="text-muted-foreground mt-1 mb-3 text-sm">
              Are you sure you want to delete <strong>{label.name}</strong> label?
            </p>
            <form
              class="ml-auto w-fit"
              method="post"
              action="?/deleteLabel"
              use:enhance={({ formData }) => {
                formData.set("labelId", label.labelId.toString());
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
    <Label required for="labelName">Name</Label>
    <Input placeholder="Label name" id="labelName" name="labelName" required />
    <ErrorMessage>{createErrorMap?.labelName}</ErrorMessage>

    <Label for="description">Description</Label>
    <Textarea name="description" id="description" placeholder="Label description" />
    <ErrorMessage>{createErrorMap?.description}</ErrorMessage>

    <ErrorMessage>{createErrorMap?.root}</ErrorMessage>

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
    <Label required for="labelName">Name</Label>
    <Input
      placeholder="Label name"
      id="labelName"
      name="labelName"
      required
      defaultValue={labelToEdit?.name ?? ""}
    />
    <ErrorMessage>{updateErrorMap?.labelName}</ErrorMessage>

    <Label for="description">Description</Label>
    <Textarea
      name="description"
      id="description"
      placeholder="Label description"
      defaultValue={labelToEdit?.description ?? ""}
    />
    <ErrorMessage>{updateErrorMap?.description}</ErrorMessage>

    <ErrorMessage>{updateErrorMap?.root}</ErrorMessage>

    <Button isLoading={isUpdatingLabel} class="mt-4 w-full">Update</Button>
  </form>
</Drawer>
