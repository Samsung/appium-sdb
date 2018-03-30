import methods from './sdb-commands.js';
import systemCallMethods from './system-calls.js';
import tpkUtilsMethods from './tpk-utils.js';

Object.assign(
    methods,
    systemCallMethods,
    tpkUtilsMethods
);

export default methods;
