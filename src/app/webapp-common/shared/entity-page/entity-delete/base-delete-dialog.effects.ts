import {deactivateLoader} from '../../../core/actions/layout.actions';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '../../../../business-logic/api-services/projects.service';
import {requestFailed} from '../../../core/actions/http.actions';
import {Injectable} from '@angular/core';
import {catchError, filter, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {EmptyAction} from '../../../../app.constants';
import {Action, Store} from '@ngrx/store';
import {forkJoin, of} from 'rxjs';
import {setServerError} from '../../../core/actions/layout.actions';
import {fromFetch} from 'rxjs/fetch';
import {AdminService} from '~/shared/services/admin.service';
import {ApiTasksService} from '../../../../business-logic/api-services/tasks.service';
import {addFailedDeletedFile, addFailedDeletedFiles, deleteEntities, deleteFileServerSources, deleteS3Sources, setFailedDeletedEntities, setNumberOfSourcesToDelete} from './common-delete-dialog.actions';
import {selectSelectedExperiments} from '../../../experiments/reducers';
import {TasksDeleteResponse} from '../../../../business-logic/model/tasks/tasksDeleteResponse';
import {selectSelectedModels} from '../../../models/reducers';
import {ApiModelsService} from '../../../../business-logic/api-services/models.service';
import {Observable} from 'rxjs/internal/Observable';
import {CloudProviders} from './common-delete-dialog.reducer';
import {selectProjectForDelete} from '../../../projects/common-projects.reducer';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {ActivateEdit} from '../../../experiments/actions/common-experiments-info.actions';
import {ActivateModelEdit} from '../../../models/actions/models-info.actions';
import {ModelsDeleteManyResponse} from '../../../../business-logic/model/models/modelsDeleteManyResponse';
import {TasksDeleteManyResponse} from '../../../../business-logic/model/tasks/tasksDeleteManyResponse';
import {ConfigurationService} from '../../services/configuration.service';
import {getBucketAndKeyFromSrc, SignResponse} from '../../../settings/admin/base-admin.service';
import {isFileserverUrl} from '../../../../shared/utils/url';

@Injectable()
export class DeleteDialogEffectsBase {

  constructor(
    public actions$: Actions,
    public store: Store<any>,
    public tasksApi: ApiTasksService,
    public modelsApi: ApiModelsService,
    public projectsApi: ApiProjectsService,
    public adminService: AdminService,
    public configService: ConfigurationService
  ) {}

  deleteEntityApi(entityType: EntityTypeEnum, entities: any[]): Observable<{ failed: any[]; succeeded: string[] }> {
    const ids = entities.map(entity => entity.id);
    switch (entityType) {
      case 'experiment':
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.tasksApi.tasksDeleteMany({ids, return_file_urls: true, force: true}).pipe(
          map((res: TasksDeleteManyResponse) => ({
            failed: res.failed,
            succeeded: res.succeeded.map(deletedExperiment =>
              [...deletedExperiment.urls.artifact_urls, ...deletedExperiment.urls.event_urls, ...deletedExperiment.urls.model_urls]
            ).flat()
          })));
      case 'model':
        return this.modelsApi.modelsDeleteMany({ids, force: true}).pipe(
          map((res: ModelsDeleteManyResponse) => ({failed: res.failed, succeeded: [...res.succeeded.map(model => model.url)]})));
      case 'project':
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.projectsApi.projectsDelete({project: entities[0].id, delete_contents: true}).pipe(
          map((res: TasksDeleteResponse) => ({
              succeeded: [...res.urls.model_urls, ...res.urls.artifact_urls, ...res.urls.event_urls],
              failed: []
            })));
      default:
        return of({succeeded: [], failed: []});
    }
  }

  getEntitySelector(entityType: EntityTypeEnum) {
    switch (entityType) {
      case 'experiment':
        return selectSelectedExperiments;
      case 'model':
        return selectSelectedModels;
      case 'project':
        return selectProjectForDelete;
    }
  }

  pauseAutorefresh(entityType: EntityTypeEnum): Action[] {
    switch (entityType) {
      case 'experiment':
        return [new ActivateEdit('delete')];
      case 'model':
        return [new ActivateModelEdit('delete')];
      default:
        return [new EmptyAction()];
    }
  }

  deleteEntitiesEffect = createEffect(() => this.actions$.pipe(
    ofType(deleteEntities),
    map(action => action),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store.select(this.getEntitySelector(action.entityType)),
      ),
      map(([, entities]) => action.entity ? [action.entity] : entities),
      switchMap(entities =>
        this.deleteEntityApi(action.entityType, entities).pipe(
          map(({failed, succeeded: urlsToDelete}) => [this.parseErrors(failed, entities), this.getUrlsPerProvider(urlsToDelete)]),
          mergeMap(([failed, urlsPerSource]: [{id: string; name: string; message: string}[], { [provider in CloudProviders]: string[] }]) => [
              ...this.pauseAutorefresh(action.entityType),
              setNumberOfSourcesToDelete({numberOfFiles: Object.values(urlsPerSource).flat().length}),
              setFailedDeletedEntities({failedEntities: failed}),
              deleteFileServerSources({files: urlsPerSource['fs']}),
              // deleteS3Sources({files: urlsPerSource['s3']}),
              // deleteGoogleCloudeSource(urlsPerSource['gc']),
              // deleteAzure(urlsPerSource['azure']),
              addFailedDeletedFiles({filePaths: urlsPerSource['misc']})
            ]
          ),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            setServerError(error, null, `Can't delete ${action.entityType} ${error?.meta?.error_data?.id || ''}`)]
          )
        )
      )
    )),
  ));

  deleteFileServerSourcesEffect = createEffect(() => this.actions$.pipe(
    ofType(deleteFileServerSources),
    mergeMap(action => forkJoin(action.files.map(url =>
      this.adminService.signUrlIfNeeded(url, {skipFileServer: false}).pipe(
        switchMap((signResponse: SignResponse) =>
          fromFetch(
            signResponse.signed,
            {method: 'DELETE', credentials: this.configService.getStaticEnvironment().useFilesProxy ? 'include' : 'omit'}
          )
        ),
        mergeMap(res => {
          if (res[0]?.status !== 200) {
            return [addFailedDeletedFile({filePath: decodeURIComponent(res[0]?.url)})];
          } else {
            return [setNumberOfSourcesToDelete({numberOfFiles: -1})];
          }
        }),
        catchError(() => [setNumberOfSourcesToDelete({numberOfFiles: -1})]),
      )
    ))),
    mergeMap(a => a as Action[])
  ));

  deleteS3SourcesEffect = createEffect(() => this.actions$.pipe(
    ofType(deleteS3Sources),
    filter(action => action.files.length > 0),
    map(action => {
      const filesPerBucket = action.files.reduce((acc, fileSrc) => {
        const {Bucket: bucket} = getBucketAndKeyFromSrc(fileSrc);
        if (!acc[bucket]) {
          acc[bucket] = [];
        }
        acc[bucket].push(fileSrc);
        return acc;
      }, {} as { [bucket: string]: string[] });
      return Object.entries(filesPerBucket);
    }),
    mergeMap(([[, files]]) => this.adminService.deleteS3Files(files, false)),
    // mergeMap(fetchPromise => forkJoin(fetchPromise)),
    map((failedFiles: { success: boolean; files: string[] }) => {
      if (failedFiles.success) {
        return setNumberOfSourcesToDelete({numberOfFiles: failedFiles.files.length});
      } else {
        return addFailedDeletedFiles({filePaths: failedFiles.files});
      }
    }),
    // TODO: return the correct number of files
    catchError(() => [setNumberOfSourcesToDelete({numberOfFiles: -1})])
  ));

  public getUrlsPerProvider(commutativeUrls: string[]): { [provider in CloudProviders]: string[] } {

    return commutativeUrls.reduce((acc, url) => {
      const sourceType = this.getSourceType(url);
      acc[sourceType].push(url);
      return acc;
    }, {fs: [], gc: [], s3: [], azure: [], misc: []});
  }

  parseErrors(failed, entities): {id: string; name: string; message: string}[] {
    return failed.map( failedEntity => ({
      id: failedEntity.id,
      name: entities.find(entity => entity.id === failedEntity.id)?.name || failedEntity.id,
      message: failedEntity.error.msg
    }));
  }

  getSourceType(src: string): CloudProviders {
    if (isFileserverUrl(src)) {
      return 'fs';
    } else {
      return 'misc';
    }
    // else if (this.adminService.isS3Url(src)) {
    //   return 's3';
    // } else if (this.adminService.isGoogleCloudUrl(src)) {
    //   return 'gc';
    // } else if (this.adminService.isAzureUrl(src)) {
    //   return 'azure';
    // } else {
    //   return 'misc';
    // }
  }

}
