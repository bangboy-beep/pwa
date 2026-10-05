module.exports = {
    testDir: './',
    fullyParallel: true,
    forbidOnly: false,
    retries: 2,
    workers: 1,
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
    },
};