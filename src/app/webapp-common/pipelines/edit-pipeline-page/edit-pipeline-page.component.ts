import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PipelineAddStepDialogComponent } from '../pipeline-add-step-dialog/pipeline-add-step-dialog.component';
import { PipelineSettingComponent } from '../pipeline-setting/pipeline-setting.component';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { createPipelineStep, settingsPipelineAction, getPipelineById, resetPipelines, resetPipelinesSearchQuery, updatePipeline, compilePipeline, runPipeline } from '../pipelines.actions';
import { selectRouterParams } from '@common/core/reducers/router-reducer';
import { Observable, Subscription, map } from 'rxjs';
import { Params } from '@angular/router';
import { selectSelectedPipeline } from '../pipelines.reducer';
import { Pipeline, PipelinesCompileRequest } from '~/business-logic/model/pipelines/models';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'sm-edit-pipeline-page',
  templateUrl: './edit-pipeline-page.component.html',
  styleUrls: ['./edit-pipeline-page.component.scss']
})
export class EditPipelinePageComponent implements OnInit, OnDestroy  {
  protected dialog = inject(MatDialog);
  protected store = inject(Store);
  public subs = new Subscription();
  public selectedPipelineId$: Observable<string>;
  private selectedPipeline$: Observable<Pipeline>;
  public selectedPipeline: Pipeline;
  public selectedStep;
  pipelineId: string;
  private reactFlowState = {nodes: [], edges: []};

  constructor() {
   
    this.selectedPipelineId$ = this.store.select(selectRouterParams).pipe(map((params: Params) => {
       // eslint-disable-next-line @ngrx/avoid-mapping-selectors
      //console.log(params);
      return params?.id
    }));
    this.selectedPipeline$ = this.store.select(selectSelectedPipeline)
  }

  ngOnInit() {
    this.subs.add(this.selectedPipelineId$.pipe(
      ).subscribe((pipelineId) => {
        this.pipelineId = pipelineId;
        setTimeout(()=> {
          this.store.dispatch(getPipelineById({id: pipelineId, name: ''}))
        }, 1000)
        }
      ));

      this.subs.add(this.selectedPipeline$.pipe(
        ).subscribe((pipelineData) => {
          this.selectedPipeline = pipelineData;
          // eslint-disable-next-line no-console
          console.log(pipelineData);
          }
        ));
  }
  
  ngOnDestroy() {
    this.subs.unsubscribe();
    this.store.dispatch(resetPipelines());
    this.store.dispatch(resetPipelinesSearchQuery());
  }

  savePipeline () {
    const pipelineState = cloneDeep(this.selectedPipeline);
    pipelineState.flow_display.nodes = this.reactFlowState.nodes;
    pipelineState.flow_display.edges = this.reactFlowState.edges; 
    this.store.dispatch(updatePipeline({changes: {...pipelineState}}));
  }

  compilePipeline () {
    let requestPayload: PipelinesCompileRequest = {
      pipeline_id: this.selectedPipeline.id,
      steps: this.selectedPipeline.flow_display.nodes.map((nodeItem) => {
        return {
          nodeName: nodeItem?.id
        }
      }),
      connections: this.selectedPipeline.flow_display.edges.map((edgeItem) => {
        return {
          startNodeName: edgeItem.source,
          endNodeName: edgeItem.target,
        }
      })
    }

    this.store.dispatch(compilePipeline({data: requestPayload}))
  }

  runPipeline () {
    this.store.dispatch(runPipeline({data: {
      pipeline_id: this.selectedPipeline.id
    }}))
  }

  createPipelineStep() {

    this.dialog.open(PipelineAddStepDialogComponent, {
      data: {defaultExperimentId: ''},
      panelClass: 'light-theme',
      width: '640px'
    })
      .afterClosed()
      .subscribe(pipeline => {
        if (pipeline) {
          this.store.dispatch(createPipelineStep({pipelinesCreateStepRequest: {...pipeline, pipeline_id: this.pipelineId}}));
        }
      });

    // this.dialog.open(PipelineDialogComponent, {
    //   data: {
    //     panelClass: 'light-theme',
    //   },
    //   width: '640px'
    // });

  }

  settings() {
    this.dialog.open(PipelineSettingComponent, {
      data: {defaultExperimentId: ''},
      panelClass: 'light-theme',
      width: '640px'
    })
      .afterClosed()
      .subscribe(pipeline => {
        if (pipeline) {
          this.store.dispatch(settingsPipelineAction({pipelinesSettingsRequest: pipeline}));
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public nodesChangedInReactFlow(data) {
    this.reactFlowState.nodes = data;
    //console.log("nodes changed", data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public edgesChangedInReactFlow(data) {
    this.reactFlowState.edges = data;
    // eslint-disable-next-line no-console
    console.log("edges changed", data);
    
  }

  public nodeSelected(data) {
    this.selectedStep = {...data};
  }


}
