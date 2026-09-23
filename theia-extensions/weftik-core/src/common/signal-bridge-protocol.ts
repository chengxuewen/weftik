/**
 * RPC protocol for the Signal Bridge service.
 *
 * The backend wraps @weftik/theia-bridge native bindings.
 * The frontend receives a proxy via WebSocketConnectionProvider.
 */
export interface SignalEntry {
    name: string;
    value: string;
}

export const SignalBridgeService = Symbol('SignalBridgeService');
export interface SignalBridgeService {
    signalSnapshot(pattern: string): Promise<SignalEntry[]>;
}

export const SignalBridgeServicePath = '/services/weftik-signal-bridge';
