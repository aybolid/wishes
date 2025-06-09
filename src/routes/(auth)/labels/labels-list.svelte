<script lang="ts">
  import { page } from "$app/state";
  import Button from "$lib/components/ui/button.svelte";
  import LabelTag from "$lib/components/ui/label-tag.svelte";
  import type { LabelWithCreator } from "$lib/server/db/schema";
  import { Edit, Trash } from "lucide-svelte";
  import type { PageData } from "./$types";
  import Popover from "$lib/components/ui/popover.svelte";
  import { enhance } from "$app/forms";

  const data = $derived(page.data as PageData);

  type Props = {
    labels: LabelWithCreator[];
  };
  const { labels }: Props = $props();
</script>

{#if labels.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No labels yet</p>
{/if}

<section class="mt-4 grid gap-4">
  {#each labels as label, i (i + label.labelId.toString())}
    {@const isUserCreator = label.creatorId === data.user.userId}
    <div class="flex flex-col gap-2 rounded-sm border p-3">
      <div class="flex items-center justify-between gap-2">
        <LabelTag {label} />
      </div>

      {#if label.description}
        <p class="text-muted-foreground mt-2 flex-1">{label.description}</p>
      {/if}

      {#if isUserCreator}
        <div class="mt-2 flex items-center justify-end gap-2">
          <Button title="Edit" size="icon" variant="secondary">
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
