import {EntityTypeEnum} from "~/shared/constants/non-common-consts";

export enum EntityTypePluralEnum {
  pipelines = 'pipelines',
  datasets = 'datasets',
  reports = 'reports',
}

export const getEntityTypeFromUrlConf = (conf: string[]): string => {
    return conf[0];
};

export const getDatasetUrlPrefix = (entityType)=> 'simple';
export const getNestedEntityBaseUrl = (entityType) => entityType;
export const isDatasetType = (entityType) => entityType === EntityTypePluralEnum.datasets ;
export const datasetLabel = (entityType) => 'DATASETS' ;

export const getNestedEntityName = (entityType: string): EntityTypeEnum => {
  switch (entityType) {
    case EntityTypePluralEnum.datasets:
      return EntityTypeEnum.simpleDataset;
    case EntityTypePluralEnum.reports:
      return EntityTypeEnum.report;
    case EntityTypePluralEnum.pipelines:
      return EntityTypeEnum.pipeline;
    default:
      return EntityTypeEnum.project;
  }
};


