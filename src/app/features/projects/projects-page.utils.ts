import {ActivatedRouteSnapshot} from "@angular/router";
import {
  getDatasetsRequest,
  getPipelineRequest,
  getReportRequest,
  isPipelines,
  isReports
} from "@common/projects/common-projects.utils";
import {ProjectsGetAllExRequest} from "~/business-logic/model/projects/projectsGetAllExRequest";

export const isDeletableProject = readyForDeletion => (readyForDeletion.experiments.unarchived + readyForDeletion.models.unarchived) === 0;

export const popupEntitiesListConst = 'experiments or model';

export const getDeleteProjectPopupStatsBreakdown = (readyForDeletion, statsSubset: 'archived' | 'unarchived' | 'total', experimentCaption): string => `${readyForDeletion.experiments[statsSubset] > 0 ? `${readyForDeletion.experiments[statsSubset]} ${experimentCaption} ` : ''}
          ${readyForDeletion.models[statsSubset] > 0 ? readyForDeletion.models[statsSubset] + ' models ' : ''}`;

export const readyForDeletionFilter = readyForDeletion => !(readyForDeletion.experiments === null || readyForDeletion.models === null);

export const isDatasets = (snapshot: ActivatedRouteSnapshot) => snapshot.firstChild.routeConfig.path === 'datasets';

export const routeConfToProjectType = (routeConf: string[]) => routeConf[0];

export const getFeatureProjectRequest = (snapshot: ActivatedRouteSnapshot, nested: boolean, searchQuery: any, selectedProjectName: any, selectedProjectId: any): ProjectsGetAllExRequest => {
  const pipelines = isPipelines(snapshot);
  const reports = isReports(snapshot);
  const datasets = isDatasets(snapshot);
  return {
    ...(pipelines && getPipelineRequest(nested, searchQuery, selectedProjectName, selectedProjectId)),
    ...(reports && getReportRequest(nested, searchQuery, selectedProjectName, selectedProjectId)),
    ...(datasets && getDatasetsRequest(nested, searchQuery, selectedProjectName, selectedProjectId)),
  };
};

export const getSelfFeatureProjectRequest = (snapshot: ActivatedRouteSnapshot) => ({
  });
