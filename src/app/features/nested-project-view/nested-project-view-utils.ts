import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

export enum EntityTypePluralEnum {
  pipelines = 'pipelines',
  datasets = 'datasets',
  reports = 'reports',
}

export const getEntityTypeFromUrlConf = (conf: string[]) => conf[0] as EntityTypePluralEnum;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDatasetUrlPrefix = (entityType)=> 'simple';
export const getNestedEntityBaseUrl = (entityType) => entityType;
export const isDatasetType = (entityType) => entityType === EntityTypePluralEnum.datasets ;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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


