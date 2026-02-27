/**
 * Zendesk Messaging helpers.
 */

type AnyFunction = (...args: any[]) => any;

const getZE = (): AnyFunction | null => {
    return (window as any)?.zE ?? null;
};

export const zendeskReady = async (): Promise<AnyFunction | null> => {
    const ze = getZE();
    if (!ze) return null;
    return new Promise((resolve) => {
        try {
            ze(() => resolve(ze));
        } catch {
            resolve(ze);
        }
    });
};

export const zendeskAuthenticateWithJwt = async (jwt: string): Promise<void> => {
    const ze = await zendeskReady();
    if (!ze || !jwt) return;
    
    return new Promise<void>((resolve, reject) => {
        ze(
            'messenger',
            'loginUser',
            (callback: (token: string) => void) => {
                callback(jwt);
            },
            (error: unknown) => {
                if (error) {
                    const errorMessage = `Zendesk loginUser error: ${error}`;
                    // eslint-disable-next-line no-console
                    console.warn(errorMessage);
                    reject(error as Error);
                } else {
                    resolve();
                }
            }
        );
    });
};

export const zendeskLogout = async (): Promise<void> => {
    const ze = await zendeskReady();
    if (!ze) return;
    return new Promise<void>((resolve) => {
        try {
            ze(
                'messenger',
                'logoutUser',
                () => resolve(),
                () => resolve()
            );
        } catch {
            resolve();
        }
    });
};


