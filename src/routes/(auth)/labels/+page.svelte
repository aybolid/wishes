<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { PlusIcon } from "lucide-svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Textarea from "$lib/components/ui/textarea.svelte";

  let isDrawerOpen = $state(false);
  let isCreatingLabel = $state(false);

  const { form, data }: { form: ActionData; data: PageServerData } = $props();

  const labels = $derived(data?.labels);

  const labelNameError = $derived(form?.createLabel.errorMap?.labelName);
  const descriptionError = $derived(form?.createLabel.errorMap?.description);
  const createRootError = $derived(form?.createLabel.errorMap?.root);
</script>

<div class="w-full">
  <Button onclick={() => (isDrawerOpen = true)} class="ml-auto">
    <PlusIcon />
    Add Label
  </Button>
</div>

<pre>{JSON.stringify(labels, null, 2)}</pre>

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
      error={labelNameError}
      label="Name"
      placeholder="Label name"
      name="labelName"
      required
    />
    <Textarea
      forceError={!!createRootError}
      error={descriptionError}
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
