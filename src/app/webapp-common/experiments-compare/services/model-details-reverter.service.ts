/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {TAGS} from '../../tasks/tasks.constants';
import {IModelInfo} from '../../experiments/shared/common-experiment-model.model';
import {ITask} from '~/business-logic/model/al-task';
import {formatDate} from '@angular/common';
import {TIME_FORMAT_STRING} from '@common/constants';
import {NA} from '~/app.constants';
import {DurationPipe} from '@common/shared/pipes/duration.pipe';
import {ModelDetail} from '@common/experiments-compare/shared/experiments-compare-details.model';
import parseHocon from 'hocon-parser';

@Injectable({
  providedIn: 'root'
})
export class ModelDetailsReverterService {

  private durationPipe: DurationPipe;

  constructor(@Inject(LOCALE_ID) public locale: string) {
    this.durationPipe = new DurationPipe();
    this.locale = locale;
  }

  revertModels(modelIds: Array<string>, models: Array<IModelInfo>): ModelDetail[] {
    // map the experiment ids to keep the user order.
    return modelIds.map(id => {
      const model = models.find(ex => ex.id === id);
      return {
        id: model.id,
        name: model.name,
        status: model.ready ? 'Ready' : 'Draft',
        last_update: model.last_update,
        last_iteration: model.last_iteration,
        project: model?.project,
        tags: model.tags,
        general: this.revertGeneral(model),
        labels: this.revertLabels(model),
        metadata: this.revertMetadata(model),
      };
    });
  }

  revertModelsDesign(modelIds: Array<string>, models: Array<IModelInfo>, safeMode: boolean): ModelDetail[] {
    // map the experiment ids to keep the user order.
    return modelIds.map(id => {
      const model = models.find(ex => ex.id === id);
      return {
        id: model.id,
        name: model.name,
        status: model.ready ? 'Ready' : 'Draft',
        last_update: model.last_update,
        last_iteration: model.last_iteration,
        project: model?.project,
        tags: model.tags,
        design: this.revertNetworkDesign(model, safeMode)
      };
    });
  }
  public revertGeneral(model: IModelInfo) {
    return {
      'created at': model.created && formatDate(model.created, TIME_FORMAT_STRING, this.locale) || NA,
      'update at': model.last_update && formatDate(model.last_update, TIME_FORMAT_STRING, this.locale) || NA,
      framework: model.framework,
      'model url':{
        dataDictionary: true,
        link: model.uri,
        dataValue: model.uri,
      },
      user: model.user.name || NA,
      'creating experiment': (model.parent as unknown as ITask)?.name || NA,
      archive: model.system_tags.includes(TAGS.HIDDEN) ? 'Yes' : 'No',
      project: model.project?.name || NA,
    };
  }


  revertNetworkDesign(model, safeMode: boolean): any {
    let networkDesign = model?.design?.design || model?.design;
    networkDesign = typeof networkDesign === 'string' ? (safeMode? networkDesign.split('\n'): parseHocon(networkDesign)) : {};
    return networkDesign;
  }

  private revertLabels(model: IModelInfo) {
    return model.labels;
  }

  private revertMetadata(model: IModelInfo) {
    return model.metadata;
  }
}
