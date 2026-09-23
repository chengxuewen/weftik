"use strict";
/**
 * Weftik Debug Panel — Browser Entry Point
 *
 * Exports the DI container module for Theia extension discovery.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakpointsViewWidget = exports.VariablesViewWidget = exports.DebugPanelWidget = exports.WeftikDebugSessionContribution = exports.WEFTIK_DEBUG_TYPE = exports.WeftikDebugSession = exports.WeftikDebugChannel = void 0;
const debug_frontend_module_1 = __importDefault(require("./debug-frontend-module"));
exports.default = debug_frontend_module_1.default;
var debug_channel_1 = require("./debug-channel");
Object.defineProperty(exports, "WeftikDebugChannel", { enumerable: true, get: function () { return debug_channel_1.WeftikDebugChannel; } });
var debug_session_1 = require("./debug-session");
Object.defineProperty(exports, "WeftikDebugSession", { enumerable: true, get: function () { return debug_session_1.WeftikDebugSession; } });
Object.defineProperty(exports, "WEFTIK_DEBUG_TYPE", { enumerable: true, get: function () { return debug_session_1.WEFTIK_DEBUG_TYPE; } });
var debug_contribution_1 = require("./debug-contribution");
Object.defineProperty(exports, "WeftikDebugSessionContribution", { enumerable: true, get: function () { return debug_contribution_1.WeftikDebugSessionContribution; } });
var debug_panel_widget_1 = require("./debug-panel-widget");
Object.defineProperty(exports, "DebugPanelWidget", { enumerable: true, get: function () { return debug_panel_widget_1.DebugPanelWidget; } });
var variables_view_1 = require("./variables-view");
Object.defineProperty(exports, "VariablesViewWidget", { enumerable: true, get: function () { return variables_view_1.VariablesViewWidget; } });
var breakpoints_view_1 = require("./breakpoints-view");
Object.defineProperty(exports, "BreakpointsViewWidget", { enumerable: true, get: function () { return breakpoints_view_1.BreakpointsViewWidget; } });
//# sourceMappingURL=index.js.map