<script>
  import { HeartRateSensor } from './lib/heartRateSensor';
  import { Howl, Howler } from 'howler';
  import Heart from './svg/Heart.svelte';
  Howler.autoUnlock = false;

  let isConnecting = false;
  let tab = 'home';
  let maxHeartRate = 100;
  let heartRate = 0;
  let hearRateBeat = false;
  let highHearRateBeat = false;

  const heartRateSensor = new HeartRateSensor();

  async function connect() {
    try {
      isConnecting = true;
      await heartRateSensor.connect();
      await heartRateSensor.enableMultiConnection();
      tab = 'setup';
    } catch (err) {
      alert(err);
    }
    isConnecting = false;
	}

  async function start() {
    heartRate = 0;
    highHearRateBeat = 0;
    tab = 'run';
    try {
      await heartRateSensor.characteristicHeartRate.startNotifications();
      heartRateSensor.characteristicHeartRate.addEventListener('characteristicvaluechanged', beat);
    } catch (err) {
      alert(err);
      tab = 'home';
    }
  }

  async function stop() {
    try {
      await heartRateSensor.characteristicHeartRate.stopNotifications();
      heartRateSensor.characteristicHeartRate.removeEventListener('characteristicvaluechanged', beat);
    } catch (err) {
      alert(err);
    }
    tab = 'setup';
  }

  function beat(event) {
    if (hearRateBeat) return;
    hearRateBeat = true;

    var heartRateMeasurement = heartRateSensor.parseHeartRate(event.target.value);
    heartRate = heartRateMeasurement.heartRate;
    if (heartRate > maxHeartRate) {
      const beep = new Howl({
        src: ['sound/beep.mp3']
      });
      beep.play();
      highHearRateBeat = true;
    } else {
      highHearRateBeat = false;
    }

    setTimeout(() => {
      hearRateBeat = false;
    }, 300);
  }
</script>

<div class="container">

  {#if tab === 'home'}
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
  {:else if tab === 'setup'}
  <div class="content">
    <div class="header">
      <h1>Max <Heart size=64 /> rate</h1>
    </div>

    <div class="button-group">
      <button class="button" on:click={() => maxHeartRate > 0 && (maxHeartRate -= 5)}>−</button>
      <div class="label">{maxHeartRate}</div>
      <button class="button" on:click={() => maxHeartRate < 300 && (maxHeartRate += 5)}>+</button>
    </div>

    <button class="button" on:click={start}>Start</button>
  </div>
  {:else if tab === 'run'}
  <div class="content">
    <div class="header">
      <div class="heartrate" class:heartrate-high="{highHearRateBeat}" class:heartrate-beat="{hearRateBeat}">{heartRate} BPM</div>
    </div>
    <button class="button" on:click={stop}>Stop</button>
  </div>
  {/if}
</div>
