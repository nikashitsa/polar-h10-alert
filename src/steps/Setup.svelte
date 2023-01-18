<script>
  import { onMount } from 'svelte';
  import Heart from '../Heart.svelte';
  import noUiSlider from 'nouislider';
  import 'nouislider/dist/nouislider.css';
  import { lowBeep } from '../lib/sound';

  export let heartRange;
  export let volume;
  export let start;

  onMount(() => {
    const sliderBpm = document.getElementById('slider-bpm');
    noUiSlider.create(sliderBpm, {
        start: heartRange,
        connect: [true, false, true],
        step: 1,
        margin: 10,
        range: {
          'min': 40,
          'max': 220
        }
    });

    sliderBpm.noUiSlider.on('update', (values) => {
      heartRange[0] = parseInt(values[0]);
      heartRange[1] = parseInt(values[1]);
      localStorage.setItem('heartRange', heartRange.join(','));
    });

    const sliderVolume = document.getElementById('slider-volume');
    noUiSlider.create(sliderVolume, {
        start: volume,
        connect: [true, false],
        step: 1,
        margin: 10,
        range: {
          'min': 0,
          'max': 100
        }
    });

    sliderVolume.noUiSlider.on('update', (values) => {
      volume[0] = parseInt(values[0]);
      localStorage.setItem('volume', volume.join(','));
      lowBeep(volume[0]);
    });
  });

</script>

<div class="content">
  <div class="header">
    <h1>Min <Heart size=64 /> Max</h1>
  </div>

  <div class="slider-group">
    <div class="label">{heartRange[0]} - {heartRange[1]} BPM</div>
    <div id="slider-bpm"></div>
  </div>

  <div class="slider-group">
    <div class="label">Volume {volume[0]} / 100</div>
    <div id="slider-volume"></div>
  </div>

  <button class="button" on:click={start}>Start</button>
</div>
