<script>
  import { HeartRateSensor } from './lib/heartRateSensor';
  import StepHome from './steps/Home.svelte';
  import StepSetup from './steps/Setup.svelte';
  import StepRun from './steps/Run.svelte';
  import { lowBeep, highBeep } from './lib/sound';

  Howler.autoUnlock = false;

  let isConnecting = false;
  let step = 'home';
  let heartRange = [40, 220];
  let volume = [90];
  const cacheHeartRange = localStorage.getItem('heartRange');
  if (cacheHeartRange) {
    heartRange = cacheHeartRange.split(',');
  }
  const cacheVolume = localStorage.getItem('volume');
  if (cacheVolume) {
    volume = cacheVolume.split(',');
  }
  let heartRate = 0;
  let hearRateBeat = false;
  let isTooLow = false;
  let isTooHigh = false;

  const heartRateSensor = new HeartRateSensor();

  async function connect() {
    try {
      isConnecting = true;
      await heartRateSensor.connect();
      await heartRateSensor.enableMultiConnection();
      step = 'setup';
    } catch (err) {
      alert(err);
    }
    isConnecting = false;
	}

  async function start() {
    heartRate = 0;
    isTooLow = false;
    isTooHigh = false;
    step = 'run';

    try {
      await heartRateSensor.characteristicHeartRate.startNotifications();
      heartRateSensor.characteristicHeartRate.addEventListener('characteristicvaluechanged', beat);
    } catch (err) {
      alert(err);
      step = 'home';
    }
  }

  async function stop() {
    try {
      await heartRateSensor.characteristicHeartRate.stopNotifications();
      heartRateSensor.characteristicHeartRate.removeEventListener('characteristicvaluechanged', beat);
    } catch (err) {
      alert(err);
    }
    step = 'setup';
  }

  function beat(event) {
    if (hearRateBeat) return;
    hearRateBeat = true;

    var heartRateMeasurement = heartRateSensor.parseHeartRate(event.target.value);
    heartRate = heartRateMeasurement.heartRate;
    const [min, max] = heartRange;

    if (heartRate > max) {
      highBeep(volume[0]);
      isTooHigh = true;
    } else if (heartRate < min) {
      lowBeep(volume[0]);
      isTooLow = true;
    } else {
      isTooHigh = false;
      isTooLow = false;
    }

    setTimeout(() => {
      hearRateBeat = false;
    }, 300);
  }
</script>

<div class="container">
  {#if step === 'home'}
  <StepHome connect={connect} />
  {:else if step === 'setup'}
  <StepSetup heartRange={heartRange} volume={volume} start={start} />
  {:else if step === 'run'}
  <StepRun isTooHigh={isTooHigh} isTooLow={isTooLow} hearRateBeat={hearRateBeat} heartRate={heartRate} stop={stop} />
  {/if}
  <div class="footer">
    <a href="https://github.com/nikashitsa/polar-h10-alert">Source code</a>
  </div>
</div>
