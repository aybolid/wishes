<script lang="ts">
  import { cn } from "$lib/utils/styles";

  type Props = {
    username: string;
  };

  const { username }: Props = $props();
  const placeholder = $derived(username.slice(0, 1).toUpperCase());

  const { isDark, color } = $derived(
    (() => {
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }

      const rgb = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        rgb[i] = (hash >> (i * 8)) & 0xff;
      }

      const color = `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

      const luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
      const isDark = luminance < 128;

      return { color, isDark };
    })(),
  );
</script>

<div
  style={`background-color: ${color}`}
  class={cn(
    "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono",
    isDark ? "text-white" : "text-black",
  )}
>
  {placeholder}
</div>
