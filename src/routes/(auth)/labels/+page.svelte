<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import { Plus } from "lucide-svelte";
  import { toast } from "svelte-sonner";
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

  const deleteErrorMap = $derived(form?.deleteLabel?.errorMap);

  $effect(() => {
    if (!deleteErrorMap?.root) return;
    toast.error("Failed to delete label", { description: deleteErrorMap.root });
  });

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
