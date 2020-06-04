export abstract class ExperimentCompareDetailsBase {
  public buildExperimentTree(experiment, baseExperiment, mergedExperiment) {
    return {
      artifacts: this.buildSectionTree(experiment, 'artifacts', mergedExperiment),
      execution: this.buildSectionTree(experiment, 'execution', mergedExperiment),
    };
  }


  abstract buildSectionTree(experiment: any, execution1: string, mergedExperiment: any);
}
