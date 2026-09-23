/**
 * Weftik Debug Session — TheiaDebugSession subclass.
 *
 * Connects to an Weftik Controller via our custom DebugChannel,
 * providing DAP 12-command adapter for the Theia Debug UI.
 */
import { DebugSession, DebugSessionData } from '@theia/debug/lib/browser/debug-session';
import { DebugSessionConnection } from '@theia/debug/lib/browser/debug-session-connection';
import { DebugConfigurationSessionOptions } from '@theia/debug/lib/browser/debug-session-options';
import { WeftikDebugChannel } from './debug-channel';
export declare const WEFTIK_DEBUG_TYPE = "weftik";
export declare class WeftikDebugSession extends DebugSession {
    readonly data: DebugSessionData;
    readonly connection: DebugSessionConnection;
    constructor(data: DebugSessionData, connection: DebugSessionConnection);
    static createChannel(options: DebugConfigurationSessionOptions): WeftikDebugChannel;
}
//# sourceMappingURL=debug-session.d.ts.map