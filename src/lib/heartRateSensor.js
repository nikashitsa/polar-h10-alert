const SERVICE_HEART_RATE = 'heart_rate';
const HEART_RATE_CONFIGURATION = 'heart_rate_measurement';
const SERVICE_CONFIGURATION = '6217ff4b-fb31-1140-ad5a-a45545d7ecf3';
const CHARACTERISTIC_CONFIGURATION = '6217ff4d-91bb-91d0-7e2a-7cd3bda8a1f3';

export class HeartRateSensor {
  constructor() {
    this.device = null;
    this.server = null;
    this.serviceHeartRate = null;
    this.serviceConfiguration = null;
    this.characteristicConfiguration = null;
    this._promises = {};
  }

  async connect() {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [ SERVICE_HEART_RATE ] }],
      optionalServices: [ SERVICE_CONFIGURATION ]
    });
    this.server = await this.device.gatt.connect();
    this.serviceHeartRate = await this.server.getPrimaryService(SERVICE_HEART_RATE);
    this.serviceConfiguration = await this.server.getPrimaryService(SERVICE_CONFIGURATION);
    this.characteristicConfiguration = await this.serviceConfiguration.getCharacteristic(CHARACTERISTIC_CONFIGURATION);
    this.characteristicHeartRate = await this.serviceHeartRate.getCharacteristic(HEART_RATE_CONFIGURATION);
  }

  async enableMultiConnection() {
    await this.characteristicConfiguration.startNotifications();
    this.characteristicConfiguration.addEventListener('characteristicvaluechanged', (event) => {
      const { value } = event.target;
      const status = value.getUint8(2);
      if (status === 1) {
        this._promises.configuration.resolve(value.byteLength === 4 && value.getUint8(3));
      } else {
        this._promises.configuration.reject(new Error('Fail!'));
      }
    });
    const multiConnection = await this._getConfiguration(9); // pfcRequestMultiConnectionSetting = 9
    if (multiConnection === 0) {
      await this._setConfiguration(8, 1) // pfcConfigureMultiConnection = 8
    };
    await this.characteristicConfiguration.stopNotifications();
  }

  async _getConfiguration(id) {
    await this.characteristicConfiguration.writeValueWithoutResponse(Uint8Array.of(id));
    const promise = new Promise((resolve, reject) => {
      this._promises.configuration = { resolve, reject };
    });
    return promise;
  }

  async _setConfiguration(id, value) {
    await this.characteristicConfiguration.writeValueWithoutResponse(Uint8Array.of(id, value));
    const promise = new Promise((resolve, reject) => {
      this._promises.configuration = { resolve, reject };
    });
    return promise;
  }

  parseHeartRate(value) {
    // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
    value = value.buffer ? value : new DataView(value);
    let flags = value.getUint8(0);
    let rate16Bits = flags & 0x1;
    let result = {};
    let index = 1;
    if (rate16Bits) {
      result.heartRate = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    } else {
      result.heartRate = value.getUint8(index);
      index += 1;
    }
    let contactDetected = flags & 0x2;
    let contactSensorPresent = flags & 0x4;
    if (contactSensorPresent) {
      result.contactDetected = !!contactDetected;
    }
    let energyPresent = flags & 0x8;
    if (energyPresent) {
      result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    }
    let rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
      let rrIntervals = [];
      for (; index + 1 < value.byteLength; index += 2) {
        rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
      }
      result.rrIntervals = rrIntervals;
    }
    return result;
  }
}
