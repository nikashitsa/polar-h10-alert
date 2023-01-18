import { Howl, Howler } from 'howler';
import highBeepPath from '../assets/sound/high_beep.mp3';
import lowBeepPath from '../assets/sound/low_beep.mp3';

export function highBeep(volume) {
  const highBeep = new Howl({
    src: [highBeepPath],
    volume: volume / 100,
  });
  highBeep.play();
}

export function lowBeep(volume) {
  const lowBeep = new Howl({
    src: [lowBeepPath],
    volume: volume / 100,
  });
  lowBeep.play();
}
