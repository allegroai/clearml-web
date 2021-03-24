import {ChangeDetectorRef, Component, ElementRef, Renderer2} from '@angular/core';
import {BaseModelMenuComponent} from '../../../../webapp-common/models/containers/model-menu/model-menu.component';
import { MatDialog } from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {ModelInfoState} from '../../../../webapp-common/models/reducers/model-info.reducer';
import {AdminService} from '../../../admin/admin.service';

@Component({
  selector: 'sm-model-menu',
  templateUrl: './model-menu.component.html',
  styleUrls: ['./model-menu.component.scss']
})
export class ModelMenuComponent extends BaseModelMenuComponent {

  constructor(
    protected dialog: MatDialog,
    protected store: Store<ModelInfoState>,
    protected adminService: AdminService,
    protected eRef: ElementRef
  ) {
    super(dialog, store, adminService, eRef);
  }
}
