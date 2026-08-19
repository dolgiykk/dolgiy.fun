import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('@vkid/sdk', () => {
    class OAuthList {
        render() {
            return this;
        }

        on() {
            return this;
        }

        close() {}
    }

    return {
        Config: { init: vi.fn() },
        ConfigResponseMode: { Callback: 'callback' },
        ConfigSource: { LOWCODE: 'lowcode' },
        Languages: { RUS: 0 },
        OAuthName: { VK: 'vkid', OK: 'ok_ru', MAIL: 'mail_ru' },
        OAuthList,
        OAuthListInternalEvents: { LOGIN_SUCCESS: 'oauthlist: success login' },
        Scheme: { DARK: 'dark' },
        WidgetEvents: { ERROR: 'common: error' },
        Auth: { exchangeCode: vi.fn() },
    };
});

afterEach(() => {
    cleanup();
});
