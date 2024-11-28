/** @param {NS} ns
 * Wait until an appointed time and then execute a hack. */
export async function main(ns) {
    // Destructure the arguments (default values should never be used and should just provide type hints)
    const [
        /*args[0]*/ target = "",
        /*args[1]*/ start_time = 0,
        /*args[2]*/ end_time = 0,
        /*args[3]*/ duration = 0,
        /*args[4]*/ description = "",
        /*args[5]*/ manipulateStock = false,
        /*args[6]*/ silentMisfires = false,
        /*args[7]*/ loopingMode = false
    ] = ns.args;

    // We may need to sleep before we start the operation to align ourselves properly with other batch cycle (HGW) operations
    let sleepDuration = start_time - Date.now();
    if (sleepDuration < 0) {
        if (!silentMisfires)
            ns.toast(`Misfire: Hack started ${-sleepDuration} ms too late. ${JSON.stringify(ns.args)}`, 'warning');
        sleepDuration = 0;
    }
    // We use the "additionalMsec" option to bundle the initial sleep time we require with the built-in operation timer
    const hgwOptions = {
        stock: manipulateStock,
        additionalMsec: sleepDuration
    }
    // In looping mode, we want increase the run time to match the time-to-weaken, so that we fire once per cycle
    if (loopingMode)
        hgwOptions.additionalMsec += duration * 3.0 // (duration * 4.0 (time-to-weaken) - duration)

    let firstLoop = true;
    do {
        const stolen = await ns.hack(target, hgwOptions);
        // If enabled, warn of any misfires
        if (stolen == 0 && !silentMisfires)
            ns.toast(`Misfire: Hack stole 0 money. ${JSON.stringify(ns.args)}`, 'warning');
        // (looping mode only) After the first loop, remove the initial sleep time used to align our start with other HGW operations
        if (firstLoop) {
            hgwOptions.additionalMsec -= sleepDuration;
            firstLoop = false;
        }
    } while (loopingMode); // Keep going only if we were started in "looping mode"
}