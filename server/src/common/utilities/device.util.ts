// import DeviceDetector from 'device-detector-js';

import DeviceDetector from 'device-detector-js';

export function parseDevice(userAgent: string) {
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(userAgent);
  let name = [`${device.os?.name || ''} ${device.os?.version || ''}`.trim()];
  name.push(
    `${device.client?.name || ''} ${device.client?.version || ''}`.trim(),
  );
  name = name.filter((n: string) => n != '');
  return name.length ? name.join(' / ') : 'Unknown';
}

export function parseMethod(method: object) {
  switch (true) {
    case method['get']:
      return 'readable';
  }
}
