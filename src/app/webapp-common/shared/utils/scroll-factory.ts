import {CloseScrollStrategy, Overlay} from '@angular/cdk/overlay';

export const scrollFactory = (overlay: Overlay): () => CloseScrollStrategy => () => overlay.scrollStrategies.close();
