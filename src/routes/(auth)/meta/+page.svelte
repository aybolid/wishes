<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import type { Label as LabelType } from "$lib/server/db/schema";
  import { Plus } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import Select from "$lib/components/ui/select.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import ErrorMessage from "$lib/components/ui/error-message.svelte";

  const { form, data }: { form: ActionData; data: PageServerData } = $props();

  let showCreatedByCurrentUser = $state(false);

  const labels = $derived(
    !showCreatedByCurrentUser
      ? data.labels
      : data.labels.filter((label) => label.creatorId === data.user.userId),
  );

  const createErrorMap = $derived(form?.createMetadata?.errorMap);
  let updateErrorMap = $derived(form?.updateLabel?.errorMap);
  const deleteErrorMap = $derived(form?.deleteLabel?.errorMap);

  let isCreateDrawerOpen = $state(false);
  let isCreatingField = $state(false);

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
    Add Metadata
  </Button>
</div>

{#if labels.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No metadata yet</p>
{/if}

<Drawer
  isOpen={isCreateDrawerOpen}
  onClose={() => (isCreateDrawerOpen = false)}
  title="Add Metadata"
>
  <form
    class="grid gap-2"
    method="post"
    action="?/createMetadata"
    use:enhance={() => {
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

    <ErrorMessage>{createErrorMap?.root}</ErrorMessage>

    <Button isLoading={isCreatingField} class="mt-4 w-full">Add</Button>
  </form>
</Drawer>
