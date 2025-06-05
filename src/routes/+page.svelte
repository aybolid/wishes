<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageServerData } from "./$types";

  const { data }: { data: PageServerData } = $props();
  const { user } = data;
</script>

<h1>Welcome to SvelteKit</h1>
<pre>{JSON.stringify(user, null, 2)}</pre>
<form method="post" action="?/logout" use:enhance>
  <button type="submit">Logout</button>
</form>
