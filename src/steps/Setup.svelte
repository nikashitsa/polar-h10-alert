<script>
  import { onMount } from 'svelte';
  import Heart from '../svg/Heart.svelte';
  import noUiSlider from 'nouislider';
  import 'nouislider/dist/nouislider.css';

  export let heartRange;
  export let start;

  onMount(() => {
    const slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: heartRange,
        connect: [true, false, true],
        step: 1,
        margin: 10,
        range: {
          'min': 40,
          'max': 220
        }
    });

    slider.noUiSlider.on('update', (values) => {
      heartRange[0] = parseInt(values[0]);
      heartRange[1] = parseInt(values[1]);
      localStorage.setItem('heartRange', heartRange.join(','));
    });
  });

</script>

<div class="content">
  <div class="header">
    <h1>Min <Heart size=64 /> Max</h1>
  </div>

  <div class="slider-group">
    <div class="label">{heartRange[0]} - {heartRange[1]} BPM</div>
    <div id="slider"></div>
  </div>

  <button class="button" on:click={start}>Start</button>
</div>
