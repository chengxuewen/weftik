"use strict";
/**
 * Workshop Playground — Browser Entry Point
 *
 * This is the module that Theia loads when it discovers the
 * "frontend" entry in package.json's `theiaExtensions` array.
 *
 * It imports the ContainerModule (the DI binding config) and
 * the Monarch tokenizer registration.
 *
 * IMPORTANT: The frontend module module itself does NOT call
 * createWeftikConfigMonarchLanguage(). That must be done after
 * Monaco is loaded. For a full extension, you'd use a
 * FrontendApplicationContribution or a MonacoContribution.
 * For this workshop, the tokenizer is a reference example.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWeftikConfigMonarchLanguage = void 0;
const workshop_playground_frontend_module_1 = __importDefault(require("./workshop-playground-frontend-module"));
const weftik_config_language_1 = require("./weftik-config-language");
Object.defineProperty(exports, "createWeftikConfigMonarchLanguage", { enumerable: true, get: function () { return weftik_config_language_1.createWeftikConfigMonarchLanguage; } });
exports.default = workshop_playground_frontend_module_1.default;
//# sourceMappingURL=index.js.map