<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import type { PageProps } from "./$types";
  import { Plus, X } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import LabelsList from "./labels-list.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import CreateLabelFrom from "./create-label-from.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import Avatar from "$lib/components/ui/avatar.svelte";
  import { goto } from "$app/navigation";

  const { form, data }: PageProps = $props();

  let selectedCreatorId = $state<string | undefined>(data.params.creatorId ?? undefined);

  $effect(() => {
    const params = new URLSearchParams();
    if (selectedCreatorId) params.set("creator", selectedCreatorId);
    goto(`?${params.toString()}`, { replaceState: true });
  });

  const deleteErrorMap = $derived(form?.deleteLabel?.errorMap);

  $effect(() => {
    if (!deleteErrorMap?.root) return;
    toast.error("Failed to delete label", { description: deleteErrorMap.root });
  });
</script>

<div class="flex w-full flex-col-reverse items-center justify-between sm:flex-row">
  <div class="flex w-full flex-col items-center gap-2 sm:flex-row">
    <div class="flex w-full items-center sm:w-fit">
      <Select
        class="w-full rounded-r-none sm:w-fit sm:min-w-[160px]"
        placeholder="Filter by creator"
        bind:value={selectedCreatorId}
        items={data.users.map((user) => ({
          value: user.userId.toString(),
          label: user.username,
        }))}
      >
        {#snippet itemRender({ item })}
          <span class="flex items-center gap-2">
            <Avatar user={{ userId: item.value, username: item.label }} />
            <span class="font-medium">{item.label}</span>
          </span>
        {/snippet}
      </Select>
      <Button
        onclick={() => (selectedCreatorId = undefined)}
        disabled={!selectedCreatorId}
        size="icon"
        variant="outline"
        class="size-8.5 rounded-l-none border-l-0"
      >
        <X />
      </Button>
    </div>
  </div>
  <Drawer title="Add Label" description="Create label to organize your wishes">
    {#snippet trigger({ props })}
      <Button {...props} class="mb-4 w-full sm:mb-0 sm:w-fit">
        <Plus />
        Add Label
      </Button>
    {/snippet}
    <CreateLabelFrom />
  </Drawer>
</div>

<LabelsList />
