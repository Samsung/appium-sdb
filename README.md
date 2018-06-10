# appium-sdb
A wrapper over tizen-sdb, implemented using ES6 and along with async/await. This package is mainly used by Appium to perform all sdb operations on tizen device.

## Usage:

example:

```js
import SDB from 'appium-sdb';

let sdb = new SDB();
await sdb.createSDB();
console.log(await sdb.getConnectedDevices());
```

### List of methods:

- `createSDB`
- `getSdbWithCorrectSdbPath`
- `getSdbVersion`
- `getSdbPath`
- `isDeviceConnected`
- `mkdir`
- `isValidClass`
- `forceStop`
- `rimraf`
- `push`
- `pull`
- `processExists`
- `forwardPort`
- `removePortForward`
- `ping`
- `restart`
- `getSdkBinaryPath`
- `ConnectDevice`
- `getCommandForOS`
- `getConnectedDevices`
- `getDeviceStatus`
- `getDevicesWithRetry`
- `getConnectedEmulators`
- `getPortFromEmulatorString`
- `restartSdb`
- `sdbExec`
- `shell`
- `setEmulatorPort`
- `setDeviceId`
- `reboot`
- `fileExists`
- `isAppInstalled`
- `startApp`
- `uninstall`
- `installFromDevicePath`
- `install`
- `root`
- `unroot`
- `takeScreenShot`
- `startExec`
- `checkProcessStatus`
- `killProcess`
