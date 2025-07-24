import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            headless: false,
            provider: 'playwright',
            instances: [
                {
                    browser: 'chromium',
                }
            ]
        },
        include: ['test/events.test.js'],
        env: {
            MapboxAccessToken: process.env.MapboxAccessToken
        }
    },
});