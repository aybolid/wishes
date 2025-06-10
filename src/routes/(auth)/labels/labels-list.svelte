<script lang="ts">
  import { page } from "$app/state";
  import Button from "$lib/components/ui/button.svelte";
  import LabelTag from "$lib/components/common/label-tag.svelte";
  import type { LabelWithCreator } from "$lib/server/db/schema";
  import { Edit, Trash } from "lucide-svelte";
  import type { ActionData, PageData } from "./$types";
  import Popover from "$lib/components/ui/popover.svelte";
  import { enhance } from "$app/forms";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import UpdateLabelForm from "./update-label-form.svelte";
  import UserLink from "$lib/components/common/user-link.svelte";

  const data = $derived(page.data as PageData);
  let form = $derived<ActionData>(page.form);

  type Props = {
    labels: LabelWithCreator[];
  };
  const { labels }: Props = $props();
</script>

{#if labels.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No labels yet</p>
{/if}

{#snippet labelCard(label: LabelWithCreator)}
  {@const isUserCreator = label.creatorId === data.user.userId}
  <div class="flex flex-col gap-2 rounded-sm border p-3">
    <div class="flex items-center justify-between gap-2">
      <LabelTag {label} />
      <UserLink user={label.creator} />
    </div>

    {#if label.description}
      <p class="text-muted-foreground mt-2 flex-1">{label.description}</p>
    {/if}

    {#if isUserCreator}
      <div class="mt-2 flex items-center justify-end gap-2">
        <Drawer
          title="Edit Label"
          description="Update label name and description"
          onOpenChange={(open) => {
            if (!open && form?.updateLabel?.errorMap) {
              form.updateLabel.errorMap = {};
            }
          }}
        >
          {#snippet trigger({ props })}
            <Button title="Edit" size="icon" variant="secondary" {...props}>
              <Edit size={16} />
            </Button>
          {/snippet}
          {#snippet children({ setOpen })}
            <UpdateLabelForm
              {label}
              onUpdate={() => setOpen(false)}
              errorMap={form?.updateLabel?.errorMap}
            />
          {/snippet}
        </Drawer>

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
{/snippet}

<section class="mt-4 grid gap-4">
  {#each labels as label, i (i + label.labelId.toString())}
    {@render labelCard(label)}
  {/each}
</section>
