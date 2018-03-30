# appium-sdb
A wrapper over tizen-sdb, implemented using ES6 and along with async/await. This package is mainly used by Appium to perform all sdb operations on tizen device.

## Test

### functional tests

```bash
gulp e2e-test
```

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
- `isDeviceConnected`
- `mkdir`
- `isValidClass`
- `forceStop`
- `rimraf`
- `push`
- `pull`
- `processExists`
- `forwardPort`
- `forwardPort`
- `ping`
- `restart`
- `getSdkBinaryPath`
- `getCommandForOS`
- `getConnectedDevices`
- `getDevicesWithRetry`
- `restartSdb`
- `sdbExec`
- `shell`
- `setEmulatorPort`
- `setDeviceId`
- `reboot`
- `isAppInstalled`
- `startApp`
- `uninstall`
- `installFromDevicePath`
- `install`
- `root`
- `unroot`
- `setWriteFileSystem`
- `installRpm`
- `installRpmRemotePath`
