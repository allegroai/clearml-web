/* eslint-disable no-console */
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { PipelineAddStepDialogComponent } from "../pipeline-add-step-dialog/pipeline-add-step-dialog.component";
import { PipelineSettingDialogComponent } from "../pipeline-setting/pipeline-setting.dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import {
  createPipelineStep,
  pipelineSettings,
  getPipelineById,
  resetPipelines,
  resetPipelinesSearchQuery,
  updatePipeline,
  compilePipeline,
  runPipeline,
  updatePipelineStep,
  deletePipelineStep,
} from "../pipelines.actions";
import { selectRouterParams } from "@common/core/reducers/router-reducer";
import { Observable, Subscription, combineLatest, map } from "rxjs";
import { Params } from "@angular/router";
import { selectSelectedPipeline } from "../pipelines.reducer";
import {
  Pipeline,
  PipelinesCompileRequest,
  PipelinesStepInputOutputMappingOptions,
} from "~/business-logic/model/pipelines/models";
import { cloneDeep } from "lodash-es";
import { ArtifactModeEnum } from "~/business-logic/model/tasks/models";
import {
  selectSelectedProject,
} from "@common/core/reducers/projects.reducer";
import {
  setBreadcrumbsOptions,
  setTags,
} from "@common/core/actions/projects.actions";
import { Project } from "~/business-logic/model/projects/project";

@Component({
  selector: "sm-edit-pipeline-page",
  templateUrl: "./edit-pipeline-page.component.html",
  styleUrls: ["./edit-pipeline-page.component.scss"],
})
export class EditPipelinePageComponent implements OnInit, OnDestroy {
  protected dialog = inject(MatDialog);
  protected store = inject(Store);
  public subs = new Subscription();
  public selectedPipelineId$: Observable<string>;
  private selectedPipeline$: Observable<Pipeline>;
  public selectedPipeline: Pipeline; // do not update this variable, maintain it readonly.
  private _selectedStep;
  public selectedStepInputOutputOptions: Array<PipelinesStepInputOutputMappingOptions>;
  pipelineId: string;

  // for breadcrumb
  public selectedProject$: Observable<Project>;

  //// nodes and edges state should be managed here for local use
  // changes will be propagated to store only after clicking on save.
  private reactFlowState = { nodes: [], edges: [] };

  constructor() {
    this.selectedPipelineId$ = this.store.select(selectRouterParams).pipe(
      map((params: Params) => {
        return params?.id;
      })
    );
    this.selectedPipeline$ = this.store.select(selectSelectedPipeline);
  }

  private recomputeSelectedStepInputOutputOptions() {
    const incommingNodes = this.getIncomingNodesForNode(
      this._selectedStep,
      this.reactFlowState.nodes,
      this.reactFlowState.edges
    );
    const options: Array<PipelinesStepInputOutputMappingOptions> = [];

    // add outputs from incomming nodes.
    incommingNodes.forEach((node) => {
      if (node.data?.experimentDetails?.execution?.artifacts?.length) {
        // for now we are using only artifacts of i/o mapping.
        node.data.experimentDetails.execution.artifacts.forEach((artifact) => {
          if (artifact.mode === ArtifactModeEnum.Output) {
            options.push({
              ...artifact,
              stepName: node.data.name,
            });
          }
        });
      }

      if (node.data?.experimentDetails?.models?.output?.length) {
        // models i/o mapping.
        node.data.experimentDetails.models.output.forEach((model) => {
          options.push({
            ...model,
            stepName: node.data.name,
            id: model.model.id,
            type: "model",
            key: model.name,
          });
        });
      }
    });

    // add pipeline parameters
    if (this.selectedPipeline?.parameters?.length) {
      this.selectedPipeline.parameters.forEach((param) => {
        options.push({
          ...param,
          stepName: this.selectedPipeline.name,
          type: "pipeline_parameter",
          key: param.name,
        });
      });
    }

    this.selectedStepInputOutputOptions = options;
    // console.log(options);
  }

  set selectedStep(data) {
    this._selectedStep = data;
    this.recomputeSelectedStepInputOutputOptions();
  }
  get selectedStep() {
    return this._selectedStep;
  }

  ngOnInit() {
    this.subs.add(
      this.selectedPipelineId$.pipe().subscribe((pipelineId) => {
        this.pipelineId = pipelineId;
        setTimeout(() => {
          this.store.dispatch(getPipelineById({ id: pipelineId, name: "" }));
        });
      })
    );

    this.subs.add(
      this.selectedPipeline$.pipe().subscribe((pipelineData) => {
        this.selectedPipeline = pipelineData;
        // eslint-disable-next-line no-console
        //console.log(pipelineData);
      })
    );

    this.selectedProject$ = this.store.select(selectSelectedProject);

    this.setupBreadcrumbsOptions();
  }

  setupBreadcrumbsOptions() {
    this.subs.add(
      combineLatest([this.selectedPipeline$, this.selectedProject$]).subscribe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([selectedPipeline, selectedProject]) => {
          this.store.dispatch(
            setBreadcrumbsOptions({
              breadcrumbOptions: {
                showProjects: false,
                featureBreadcrumb: {
                  name: "PIPELINES",
                  url: "pipelines",
                },
                subFeatureBreadcrumb: {
                  name: "Edit",
                },
                projectsOptions: {
                  basePath: "pipelines",
                  filterBaseNameWith: [".pipelines"],
                  compareModule: null,
                  showSelectedProject: true,
                  selectedProjectBreadcrumb: {
                    name: selectedPipeline.name,
                  },
                },
              },
            })
          );
        }
      )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.store.dispatch(resetPipelines());
    this.store.dispatch(resetPipelinesSearchQuery());
    this.store.dispatch(setTags({ tags: [] }));
  }

  savePipeline() {
    const pipelineState = cloneDeep(this.selectedPipeline);
    pipelineState.flow_display.nodes = this.reactFlowState.nodes;
    pipelineState.flow_display.edges = this.reactFlowState.edges;
    this.store.dispatch(updatePipeline({ changes: { ...pipelineState } }));
  }

  compilePipeline() {
    const requestPayload: PipelinesCompileRequest = {
      pipeline_id: this.selectedPipeline.id,
      steps: this.selectedPipeline.flow_display.nodes.map((nodeItem) => {
        return {
          nodeName: nodeItem?.id,
        };
      }),
      connections: this.selectedPipeline.flow_display.edges.map((edgeItem) => {
        return {
          startNodeName: edgeItem.source,
          endNodeName: edgeItem.target,
        };
      }),
    };

    this.store.dispatch(compilePipeline({ data: requestPayload }));
  }

  runPipeline() {
    this.store.dispatch(
      runPipeline({
        data: {
          pipeline_id: this.selectedPipeline.id,
        },
      })
    );
  }

  createPipelineStep() {
    this.dialog
      .open(PipelineAddStepDialogComponent, {
        data: { defaultExperimentId: "" },
        panelClass: "light-theme",
        width: "640px",
      })
      .afterClosed()
      .subscribe((pipeline) => {
        if (pipeline) {
          this.store.dispatch(
            createPipelineStep({
              pipelinesCreateStepRequest: {
                ...pipeline,
                pipeline_id: this.pipelineId,
              },
            })
          );
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
    this.dialog
      .open(PipelineSettingDialogComponent, {
        data: { defaultExperimentId: "" },
        panelClass: "light-theme",
        width: "640px",
      })
      .afterClosed()
      .subscribe((pipeline) => {
        if (pipeline) {
          this.store.dispatch(
            pipelineSettings({ pipelinesSettingsRequest: pipeline })
          );
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public nodesChangedInReactFlow(data) {
    this.reactFlowState.nodes = cloneDeep(data);
    this.recomputeSelectedStepInputOutputOptions();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public edgesChangedInReactFlow(data) {
    this.reactFlowState.edges = cloneDeep(data);
    this.recomputeSelectedStepInputOutputOptions();
  }

  public nodeSelected(data) {
    this.selectedStep = cloneDeep(data);
  }

  public stepDelete(data) {
    this.store.dispatch(deletePipelineStep({ stepId: data.id }));
    const filteredNodes = this.reactFlowState.nodes.filter(
      (node) => node?.id !== data.id
    );
    const filteredEdges = this.reactFlowState.edges.filter(
      (edge) => edge?.source !== data.id && edge?.target !== data.id
    );

    this.reactFlowState.nodes = cloneDeep(filteredNodes);
    this.reactFlowState.edges = cloneDeep(filteredEdges);
    console.log(this.reactFlowState);
    setTimeout(() => this.savePipeline(), 1000);
    this.selectedStep = null;
  }

  public selectedStepParamsChanged(changedParams) {
    this.reactFlowState.nodes.map((node, index) => {
      if (node.id === this.selectedStep.id) {
        this.reactFlowState.nodes[index].data.parameters =
          cloneDeep(changedParams);
      }
      return node;
    });

    //update node API call here. Update silently.
    this.store.dispatch(
      updatePipelineStep({
        changes: {
          step: this.selectedStep.id,
          parameters: cloneDeep(changedParams),
        },
      })
    );

    //console.log(pipelineState);
    // pipelineState.flow_display?.nodes.map((node) => {
    //   if(node.id === this.selectedStep.id) {
    //     node.data.parameters = cloneDeep(changedParams)
    //   }
    //   return node;
    // });
    // console.log(pipelineState);
    //this.store.dispatch(setSelectedPipeline({data: cloneDeep(pipelineState)}))
  }

  /**
   * @function getIncomingNodeIds
   * @description It is used to get the incoming node ids.
   * @param {object} node - Object of the node.
   * @param {array} edges - list of all edges.
   * @returns {array} list of incoming node ids.
   */
  private getIncomingNodesForNode(node, nodes, edges) {
    const incomingNodes = [];
    edges.forEach((edge) => {
      if (node?.id === edge.target) {
        incomingNodes.push(nodes.find((node) => node.id == edge?.source));
      }
    });
    return incomingNodes;
  }
}
