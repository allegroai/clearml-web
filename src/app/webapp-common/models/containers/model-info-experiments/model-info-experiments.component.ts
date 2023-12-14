import {Component, ViewChild} from '@angular/core';
import {Store} from "@ngrx/store";
import {ModelInfoState} from "@common/models/reducers/model-info.reducer";
import {selectSelectedModel} from "@common/models/reducers";
import {Observable} from "rxjs";
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ExperimentsTableComponent} from "@common/experiments/dumb/experiments-table/experiments-table.component";
import {SelectedModel} from "@common/models/shared/models.model";
import {map} from "rxjs/operators";
import {get} from "lodash-es";
import {addMessage} from "@common/core/actions/layout.actions";


@Component({
  selector: 'sm-model-info-experiments',
  templateUrl: './model-info-experiments.component.html',
  styleUrls: ['./model-info-experiments.component.scss']
})
export class ModelInfoExperimentsComponent {
  public entityType = EntityTypeEnum.experiment;

  @ViewChild(ExperimentsTableComponent) table: ExperimentsTableComponent;
  public selectedModel$: Observable<SelectedModel>;
  public selectedModelCreatingTaskLink$: Observable<string>;


  constructor(private store: Store<ModelInfoState>,
  ) {
    this.selectedModel$ = this.store.select(selectSelectedModel);
    this.selectedModelCreatingTaskLink$ = this.selectedModel$.pipe(map(model=>`/projects/${get( model, 'task.project.id', '*')}/experiments/${get(model, 'task.id','' )}` ));
  }


  copyToClipboard() {
    this.store.dispatch(addMessage('success', 'Copied to clipboard'));
  }
}
