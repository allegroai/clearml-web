import {Actions} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {DeleteDialogEffectsBase} from '@common/shared/entity-page/entity-delete/base-delete-dialog.effects';


@Injectable()
export class DeleteDialogEffects extends DeleteDialogEffectsBase {
  constructor(actions$: Actions) {
    super(actions$);
  }
  // (Nir) don't delete this. Other repositories need to override some base functions.
}
