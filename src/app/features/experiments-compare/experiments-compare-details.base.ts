export abstract class ExperimentCompareDetailsBase {
  public buildExperimentTree(experiment, baseExperiment, mergedExperiment, param) {
    return {
      artifacts: this.buildSectionTree(experiment, 'artifacts', mergedExperiment),
      execution: this.buildSectionTree(experiment, 'execution', mergedExperiment),
      configuration: this.buildSectionTree(experiment, 'configuration', mergedExperiment),
    };
  }


  abstract buildCompareTree(experiments, hasDataFeature?);
  abstract buildSectionTree(experiment: any, execution1: string, mergedExperiment: any);
}
