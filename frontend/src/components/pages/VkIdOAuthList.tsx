import { useEffect, useRef, useState } from 'react';
import {
    Auth,
    Config,
    ConfigResponseMode,
    ConfigSource,
    Languages,
    OAuthList,
    OAuthListInternalEvents,
    OAuthName,
    Scheme,
    WidgetEvents,
} from '@vkid/sdk';

type Props = {
    onSuccess: (accessToken: string) => Promise<void>;
};

const appId = Number(import.meta.env.VITE_VK_APP_ID);

export default function VkIdOAuthList({ onSuccess }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onSuccessRef = useRef(onSuccess);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    useEffect(() => {
        const container = containerRef.current;

        if (!container || !Number.isFinite(appId) || appId < 1) {
            return;
        }

        Config.init({
            app: appId,
            redirectUrl: window.location.origin,
            responseMode: ConfigResponseMode.Callback,
            source: ConfigSource.LOWCODE,
            scope: 'email',
        });

        const oauth = new OAuthList();

        oauth
            .render({
                container,
                scheme: Scheme.DARK,
                lang: Languages.RUS,
                oauthList: [OAuthName.VK, OAuthName.OK, OAuthName.MAIL],
            })
            .on(WidgetEvents.ERROR, () => {
                setError('Не удалось загрузить вход через VK.');
            })
            .on(
                OAuthListInternalEvents.LOGIN_SUCCESS,
                (payload: { code?: string; device_id?: string }) => {
                    const code = payload.code;
                    const deviceId = payload.device_id;

                    if (!code || !deviceId) {
                        setError('VK не вернул код авторизации.');
                        return;
                    }

                    setError(null);

                    void Auth.exchangeCode(code, deviceId)
                        .then((tokens) => onSuccessRef.current(tokens.access_token))
                        .catch(() => {
                            setError('Не удалось войти через VK.');
                        });
                },
            );

        return () => {
            oauth.close();
        };
    }, []);

    if (!Number.isFinite(appId) || appId < 1) {
        return null;
    }

    return (
        <div className="auth-card__vk">
            {error ? <p className="auth-card__error">{error}</p> : null}
            <div ref={containerRef} className="auth-card__vk-widget" />
        </div>
    );
}
