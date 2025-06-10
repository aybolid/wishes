<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import Avatar from "$lib/components/ui/avatar.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Popover from "$lib/components/ui/popover.svelte";
  import type { MetadataFieldWithCreator } from "$lib/server/db/schema";
  import { Edit, Trash } from "lucide-svelte";
  import type { PageData } from "./$types";
  import UserLink from "$lib/components/common/user-link.svelte";

  type Props = {
    fields: MetadataFieldWithCreator[];
  };

  let { user } = $derived(page.data as PageData);

  const { fields }: Props = $props();
</script>

{#if fields.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No metadata yet</p>
{/if}

{#snippet fieldCard(field: MetadataFieldWithCreator)}
  {@const isUserCreator = field.creatorId === user.userId}
  <div class="rounded-sm border p-3">
    <div class="flex items-center justify-between gap-2">
      <h3 class="font-semibold">
        {field.name}
        <span class="text-primary font-normal">({field.config.type})</span>
      </h3>
      <UserLink user={field.creator} />
    </div>
    {#if field.description}
      <p class="text-muted-foreground mt-2 flex-1">{field.description}</p>
    {/if}
    {#if field.config.type === "option"}
      <p class="mt-4">
        Possible values:
        <span class="text-muted-foreground">
          {field.config.options.join(", ")}
        </span>
      </p>
    {/if}
    {#if isUserCreator}
      <div class="mt-4 flex items-center justify-end gap-2">
        <Button title="Edit" size="icon" variant="secondary">
          <Edit size={16} />
        </Button>
        <Popover>
          {#snippet trigger({ props })}
            <Button {...props} type="button" title="Delete" size="icon" variant="destructive">
              <Trash size={16} />
            </Button>
          {/snippet}

          <h3 class="font-semibold">Delete field</h3>
          <p class="text-muted-foreground mt-1 mb-3 text-sm">
            Are you sure you want to delete <strong>{field.name}</strong> field?
          </p>
          <form
            class="ml-auto w-fit"
            method="post"
            action="?/deleteMetadata"
            use:enhance={({ formData }) => {
              formData.set("fieldId", field.fieldId.toString());
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
  {#each fields as field, i (i + field.fieldId.toString())}
    {@render fieldCard(field)}
  {/each}
</section>
