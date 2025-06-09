<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import DrawerOld from "$lib/components/ui/drawer-old.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import type { Label as LabelType } from "$lib/server/db/schema";
  import { Plus } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import Label from "$lib/components/ui/label.svelte";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";
  import LabelsList from "./labels-list.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import CreateLabelFrom from "./create-label-from.svelte";

  const { form, data }: { form: ActionData; data: PageServerData } = $props();

  let showCreatedByCurrentUser = $state(false);

  const labels = $derived(
    !showCreatedByCurrentUser
      ? data.labels
      : data.labels.filter((label) => label.creatorId === data.user.userId),
  );

  let updateErrorMap = $derived(form?.updateLabel?.errorMap);
  const deleteErrorMap = $derived(form?.deleteLabel?.errorMap);

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
  <Drawer title="Add Label" description="Create label to organize your wishes">
    {#snippet trigger({ props })}
      <Button {...props}>
        <Plus />
        Add Label
      </Button>
    {/snippet}
    <CreateLabelFrom />
  </Drawer>
</div>

<LabelsList {labels} />

<DrawerOld
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
</DrawerOld>
