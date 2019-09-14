import SDB from 'appium-sdb';

let sdb = new SDB();

class Tester {
  async Main() {
    await SDB.createSDB();
    console.log(await sdb.getConnectedDevices());
  }
}

const tester = new Tester();
