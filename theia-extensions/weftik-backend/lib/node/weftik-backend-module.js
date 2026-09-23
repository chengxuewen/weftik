"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("@theia/core/shared/inversify");
const node_1 = require("@theia/core/lib/node");
const weftik_backend_service_1 = require("./weftik-backend-service");
exports.default = new inversify_1.ContainerModule((bind) => {
    bind(weftik_backend_service_1.WeftikBackendService).toSelf().inSingletonScope();
    bind(node_1.BackendApplicationContribution).toService(weftik_backend_service_1.WeftikBackendService);
});
//# sourceMappingURL=weftik-backend-module.js.map