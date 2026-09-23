import { injectable } from '@theia/core/shared/inversify';
import type { FrontendApplicationContribution, FrontendApplication } from '@theia/core/lib/browser';

/**
 * Forces the browser tab title to always show "Weftik Studio"
 * regardless of which workspace folder is open.
 */
@injectable()
export class WindowTitleContribution implements FrontendApplicationContribution {
    async onStart(_app: FrontendApplication): Promise<void> {
        document.title = 'Weftik Studio';

        // Also watch for title changes from Theia and override them
        const observer = new MutationObserver(() => {
            if (document.title !== 'Weftik Studio') {
                document.title = 'Weftik Studio';
            }
        });
        observer.observe(document.querySelector('title')!, {
            childList: true,
            characterData: true,
            subtree: true,
        });
    }
}
