import { ContainerModule } from '@theia/core/shared/inversify';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { WeftikBackendService } from './weftik-backend-service';

export default new ContainerModule((bind) => {
    bind(WeftikBackendService).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toService(WeftikBackendService);
});
