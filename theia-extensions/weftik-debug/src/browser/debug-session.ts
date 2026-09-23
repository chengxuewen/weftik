/**
 * Weftik Debug Session — TheiaDebugSession subclass.
 *
 * Connects to an Weftik Controller via our custom DebugChannel,
 * providing DAP 12-command adapter for the Theia Debug UI.
 */

import { injectable, inject } from '@theia/core/shared/inversify';
import { DebugSession, DebugSessionData } from '@theia/debug/lib/browser/debug-session';
import { DebugSessionConnection } from '@theia/debug/lib/browser/debug-session-connection';
import { DebugConfigurationSessionOptions } from '@theia/debug/lib/browser/debug-session-options';
import { WeftikDebugChannel } from './debug-channel';

export const WEFTIK_DEBUG_TYPE = 'weftik';

@injectable()
export class WeftikDebugSession extends DebugSession {
    constructor(
        @inject(DebugSessionData) override readonly data: DebugSessionData,
        @inject(DebugSessionConnection) override readonly connection: DebugSessionConnection,
    ) {
        super();
    }

    static createChannel(options: DebugConfigurationSessionOptions): WeftikDebugChannel {
        const config = options.configuration;
        const socketPath = (typeof config.socketPath === 'string')
            ? config.socketPath
            : '/tmp/weftik-controller.sock';
        const secret = (typeof config.secret === 'string')
            ? config.secret
            : 'weftik-dev-secret';
        return new WeftikDebugChannel({ socketPath, secret });
    }
}
