<script>
  export let connect;
  let isConnecting = false;
</script>

<div class="content">
  <div class="header">
    <h1>Polar H10 alert</h1>
  </div>
  {#if isConnecting}
    <button class="button">Loading...</button>
  {:else}
    <button class="button" on:click={connect}>Connect</button>
  {/if}
</div>
