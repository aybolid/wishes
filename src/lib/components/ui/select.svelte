<script lang="ts">
  import { cn } from "$lib/utils/styles";
  import { Select } from "bits-ui";
  import { Check, ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-svelte";
  import type { Snippet } from "svelte";

  type Props = {
    placeholder?: string;
    id?: string;
    itemRender?: Snippet<[{ item: { label: string; value: string } }]>;
    class?: string;
  } & ({ type?: "multiple" | any; value?: string[] | any } | { type?: "single"; value?: string }) &
    Omit<Select.RootProps, "value" | "onValueChange" | "type">;

  let {
    value = $bindable(),
    type = "single",
    placeholder = "Select",
    itemRender,
    class: className,
    ...props
  }: Props = $props();

  let selected = $derived(
    type === "multiple"
      ? props.items?.filter((item) => value?.includes(item.value))
      : props.items?.find((item) => value === item.value),
  );
</script>

<Select.Root {type} onValueChange={(v: string | string[]) => (value = v)} bind:value {...props}>
  <Select.Trigger
    id={props.id || props.name}
    class={cn(
      "focus:ring-primary bg-background data-placeholder:text-muted-foreground/80 inline-flex min-h-8.5 w-full items-center rounded-sm border px-3 py-1 select-none focus:ring",
      className,
    )}
    aria-label="Select an option"
  >
    {#if selected === undefined}
      {placeholder}
    {:else if Array.isArray(selected) && selected.length > 0}
      <!---->
      {#if itemRender}
        <div class="flex flex-wrap gap-2">
          {#each selected as item, i (i + item.value)}
            {@render itemRender({ item })}
          {/each}
        </div>
      {:else}
        {selected.length} selected
      {/if}
    {:else if !Array.isArray(selected)}
      <!---->
      {#if itemRender}
        {@render itemRender({ item: selected })}
      {:else}
        {selected.label}
      {/if}
    {:else}
      {placeholder}
    {/if}
    <ChevronsUpDown size={16} class="text-muted-foreground ml-auto" />
  </Select.Trigger>

  <Select.Portal>
    <Select.Content
      class="bg-background z-50 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-sm border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
      sideOffset={10}
    >
      <Select.ScrollUpButton class="flex w-full items-center justify-center">
        <ChevronUp size={16} class="text-muted-foreground" />
      </Select.ScrollUpButton>

      <Select.Viewport class="p-1">
        {#each props.items ?? [] as item, i (i + item.value)}
          <Select.Item
            class="data-highlighted:bg-muted/20 flex h-7 w-full items-center rounded-sm px-1.5 py-3 text-sm capitalize outline-hidden select-none data-disabled:opacity-50"
            value={item.value}
            label={item.label}
            disabled={item.disabled}
          >
            {#snippet children({ selected })}
              {#if itemRender}
                {@render itemRender({ item })}
              {:else}
                {item.label}
              {/if}
              {#if selected}
                <div class="ml-auto">
                  <Check size={16} class="text-primary" />
                </div>
              {/if}
            {/snippet}
          </Select.Item>
        {/each}
      </Select.Viewport>

      <Select.ScrollDownButton class="flex w-full items-center justify-center">
        <ChevronDown size={16} class="text-muted-foreground" />
      </Select.ScrollDownButton>
    </Select.Content>
  </Select.Portal>
</Select.Root>
