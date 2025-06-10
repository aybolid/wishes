<script lang="ts">
  import { Label, Switch } from "bits-ui";

  type Props = {
    label?: string;
  } & Omit<Switch.RootProps, "value">;
  let { label = "", checked = $bindable(false), ...props }: Props = $props();
</script>

<div class="flex items-center space-x-3">
  <Switch.Root
    id={props.id || props.name}
    bind:checked
    value={checked ? "true" : "false"}
    {...props}
    class="focus-visible:ring-primary data-[state=checked]:bg-muted data-[state=unchecked]:bg-muted dark:data-[state=checked]:bg-muted peer inline-flex h-[24px] min-h-[24px] w-[40px] shrink-0 cursor-pointer items-center rounded-full border px-[3px] transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Switch.Thumb
      class="bg-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:bg-primary dark:shadow-popover pointer-events-none block size-[20px] shrink-0 rounded-full transition-all data-[state=checked]:translate-x-3.5 data-[state=checked]:border-none data-[state=unchecked]:-translate-x-0.5"
    />
  </Switch.Root>
  {#if !checked}
    <input type="hidden" name={props.id || props.name} value="false" id="whatever" />
  {/if}
  {#if label}
    <Label.Root for={props.id || props.name} class="text-sm">{label}</Label.Root>
  {/if}
</div>
