declare module 'appium-sdb' {
  import _ from 'lodash';

  export interface SDBProps {
    sdkRoot?: any;
    udid?: any;
    executable: {
      path: string;
      defaultArgs: any[];
    };
    curDeviceId?: any;
    emulatorPort?: any;
    binaries: object;
    suppressKillServer?: any;
    sdbPort?: number;
    remoteSdbPort?: number;
  }

  type Device = { uuid: string; state: string; platform: string };

  export class SDB {
    constructor(opts?: SDBProps);

    static createSDB(opts?: SDBProps): Promise<SDB>;

    // SDB Commands

    getSdbWithCorrectSdbPath(): Promise<SDB>;

    isDeviceConnected(): Promise<boolean>;

    mkdir(remotePath: string): Promise<any>;

    isValidClass(classString: string): RegExpExecArray;

    forceStop(pkg: string): Promise<any>;

    getSdbPath(): string;

    rimraf(path: string): Promise<any>;

    push(localPath: string, remotePath: string, opts: string[]): Promise<any>;

    pull(remotePath: string, localPath: string): Promise<any>;

    processExists(processName: string): Promise<boolean>;

    forwardPort(systemPort: number, devicePort: number): Promise<any>;

    removePortForward(systemPort: number): Promise<any>;

    ping(): Promise<boolean>;

    restart(): Promise<any>;

    takeScreenShot(): Promise<boolean>;

    // System Call Methods

    getConnectedDevices(): Promise<Device[]>;

    getDeviceStatus(): Promise<'device' | 'offline' | 'locked' | 'unkown'>;

    ConnectDevice(device: string | number): Promise<boolean>;

    getDevicesWithRetry(timeoutMs?: number): Promise<any>;

    restartSdb(): Promise<boolean>;

    sdbExec(cmd: string, opts?: object): Promise<any>;

    shell(cmd: string, opts?: object): Promise<any>;

    getPortFromEmulatorString(emStr: string): Promise<number | boolean>;

    getConnectedEmulators(): Promise<any[]>;

    setDeviceId(deviceId: number | string): void;

    setDevice(deviceObj: object): void;

    getSdbVersion: (() => Promise<{
      versionString: any;
      versionFloat: number;
      major: number;
      minor: number;
      patch: number;
    }>) &
      _.MemoizedFunction;

    reboot(): Promise<boolean>;

    root(): Promise<boolean>;

    unroot(): Promise<boolean>;

    fileExists(remotePath: string): Promise<boolean>;

    ls(remotePath: string): Promise<any[]>;

    getSdkBinaryPath(binaryName: string): Promise<string>;

    getCommandForOS(): 'which' | 'where';

    setEmulatorPort(emPort: number): void;

    killProcess(process: string | number, opts?: object): Promise<boolean>;

    checkProcessStatus(process: string | number, opts?: object): Promise<boolean>;

    startExec(exec: string, opts?: object): Promise<void>;

    stopAutoSleep(): Promise<void>;

    startAutoSleep(): Promise<void>;

    // TPK Utils

    isAppInstalled(pkg: any): Promise<boolean>;

    startApp(pkg: any, opts?: object): Promise<boolean>;

    isStartedApp(pkg: any, opts?: object): Promise<boolean>;

    uninstall(pkg: any): Promise<boolean>;

    installFromDevicePath(tpkPathOnDevice: string | number): Promise<boolean>;

    install(tpk: any, pkg?: any, replace?: boolean, timeout?: number): Promise<boolean>;
  }

  export const DEFAULT_SDB_PORT: number;

  export default SDB;
}
