<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { PlusIcon } from "lucide-svelte";
  import type { ActionData } from "./$types";
  import { fromAction } from "svelte/attachments";
  import Textarea from "$lib/components/ui/textarea.svelte";

  let isDrawerOpen = $state(false);
  let isCreatingLabel = $state(false);

  const { form }: { form: ActionData } = $props();

  const labelNameError = $derived(form?.createLabel.errorMap?.labelName);
  const descriptionError = $derived(form?.createLabel.errorMap?.description);
</script>

<div class="w-full">
  <Button onclick={() => (isDrawerOpen = true)} class="ml-auto">
    <PlusIcon />
    Add Label
  </Button>
</div>

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
    <Input error={labelNameError} label="Name" placeholder="Label name" name="labelName" required />
    <Textarea
      error={descriptionError}
      label="Description"
      name="description"
      placeholder="Label description"
    />

    <Button isLoading={isCreatingLabel} class="mt-4 w-full">Add</Button>
  </form>
</Drawer>
