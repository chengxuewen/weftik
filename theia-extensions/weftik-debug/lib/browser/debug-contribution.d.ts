/**
 * Weftik Debug Contribution — Registers the 'weftik' debug type in Theia.
 *
 * Provides default debug configurations and wires the WeftikDebugSession.
 */
import { DebugSessionContribution, DebugSessionFactory } from '@theia/debug/lib/browser/debug-session-contribution';
import { OutputChannelManager } from '@theia/output/lib/browser/output-channel';
export declare class WeftikDebugSessionContribution implements DebugSessionContribution {
    debugType: string;
    protected readonly outputChannelManager: OutputChannelManager;
    debugSessionFactory(): DebugSessionFactory;
}
//# sourceMappingURL=debug-contribution.d.ts.map