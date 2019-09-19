module.exports = () => {
    let running = false;
    let startTime = null;
    let endTime = null;

    const start = () => {
        if (!running) {
            startTime = process.hrtime();
            running = true;
        }
    };

    const stop = () => {
        if (running) {
            endTime = process.hrtime(startTime);
            running = false;
        }
    };

    const clear = () => {
        startTime = null;
        endTime = null;
        running = false;
    };

    const isRunning = () => running;

    const isStopped = () => endTime !== null;

    const minutes = () => {
        if (!startTime) { return 0; }
        if (endTime) {
            return Math.floor(endTime[0] / 60);
        }
        return Math.floor(process.hrtime(startTime)[0] / 60);
    };

    const seconds = () => {
        if (!startTime) { return 0; }
        if (endTime) {
            return endTime[0] % 60;
        }
        return process.hrtime(startTime)[0] % 60;
    };

    const milliseconds = () => {
        if (!startTime) { return 0; }
        if (endTime) {
            return Math.floor(endTime[1] / 1e6);
        }
        return Math.floor(process.hrtime(startTime)[1] / 1e6);
    };

    const currTime = (f) => {
        const template = f || '%mn:%s.%ms';
        return template
            .replace('%mn', minutes())
            .replace('%s', seconds().toString().padStart(2, '0'))
            .replace('%ms', milliseconds().toString().padStart(3, '0')).slice(0, -1);
    };

    return {
        start,
        stop,
        clear,
        isRunning,
        isStopped,
        minutes,
        seconds,
        milliseconds,
        currTime,
    };
};
