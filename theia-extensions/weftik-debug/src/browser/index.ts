/**
 * Weftik Debug Panel — Browser Entry Point
 *
 * Exports the DI container module for Theia extension discovery.
 */

import frontendModule from './debug-frontend-module';
export default frontendModule;

export { WeftikDebugChannel } from './debug-channel';
export type { IDebugBridge } from './debug-channel';
export { WeftikDebugSession, WEFTIK_DEBUG_TYPE } from './debug-session';
export { WeftikDebugSessionContribution } from './debug-contribution';
export { DebugPanelWidget } from './debug-panel-widget';
export { VariablesViewWidget } from './variables-view';
export type { RegisterEntry } from './variables-view';
export { BreakpointsViewWidget } from './breakpoints-view';
