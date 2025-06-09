<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import { Plus } from "lucide-svelte";
  import CreateMetaForm from "./create-meta-form.svelte";
  import FieldsList from "./fields-list.svelte";

  const { form, data }: { form: ActionData; data: PageServerData } = $props();

  let showCreatedByCurrentUser = $state(false);

  let isCreateDrawerOpen = $state(false);

  const fields = $derived(
    !showCreatedByCurrentUser
      ? data.fields
      : data.fields.filter((field) => field.creatorId === data.user.userId),
  );

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

<FieldsList {fields} />
<CreateMetaForm {form} bind:isOpen={isCreateDrawerOpen} />
