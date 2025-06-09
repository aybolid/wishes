<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import type { PageProps } from "./$types";
  import { Plus } from "lucide-svelte";
  import CreateMetaForm from "./create-meta-form.svelte";
  import FieldsList from "./fields-list.svelte";
  import { toast } from "svelte-sonner";
  import Drawer from "$lib/components/ui/drawer.svelte";

  const { form, data }: PageProps = $props();

  const deleteErrorMap = $derived(form?.deleteMetadata?.errorMap);
  $effect(() => {
    if (!deleteErrorMap?.root) return;
    toast.error("Failed to delete field", { description: deleteErrorMap.root });
  });

  let showCreatedByCurrentUser = $state(false);
  const fields = $derived(
    !showCreatedByCurrentUser
      ? data.fields
      : data.fields.filter((field) => field.creatorId === data.user.userId),
  );
</script>

<div class="flex w-full items-center justify-between">
  <Button
    onclick={() => (showCreatedByCurrentUser = !showCreatedByCurrentUser)}
    variant="outline"
    size="sm"
    class="w-40"
  >
    {showCreatedByCurrentUser ? "Show All" : "Show Created By Me"}
  </Button>
  <Drawer title="Add Metadata" description="Create metadata field for your wishes">
    {#snippet trigger({ props })}
      <Button {...props}>
        <Plus />
        Add Metadata
      </Button>
    {/snippet}
    <CreateMetaForm />
  </Drawer>
</div>

<FieldsList {fields} />
