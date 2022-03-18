<script>
  export let isTooLow;
  export let isTooHigh;
  export let hearRateBeat;
  export let heartRate;
  export let stop;
</script>

<div class="content">
  <div class="header">
    <div class="heartrate" class:heartrate-alert="{isTooLow || isTooHigh}" class:heartrate-beat="{hearRateBeat}">{heartRate} BPM</div>
    {#if isTooLow}
    <div>Too low!</div>
    {:else if isTooHigh}
    <div>Too high!</div>
    {:else}
    <div>Good</div>
    {/if}
  </div>
  <button class="button" on:click={stop}>Stop</button>
</div>
