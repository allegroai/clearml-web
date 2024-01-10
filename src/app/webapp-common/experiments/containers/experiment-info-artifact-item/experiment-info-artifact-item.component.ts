import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {Store} from '@ngrx/store';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {selectDownloadingArtifact, selectExperimentModelInfoData} from '../../reducers';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';

@Component({
  selector: 'sm-experiment-info-artifact-item',
  templateUrl: './experiment-info-artifact-item.component.html',
  styleUrls: ['./experiment-info-artifact-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentInfoArtifactItemComponent implements OnInit, OnDestroy {
  public modelInfo$: Observable<IExperimentModelInfo>;
  public editable$: Observable<boolean>;
  public saving$: Observable<boolean>;
  private artifactSubscription: Subscription;
  public selectedArtifact: Artifact;
  public artifactKey$: Observable<{key: string; mode: string}>;
  public downloadingArtifact$ = this.store.select(selectDownloadingArtifact);

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
    this.artifactKey$ = this.store.select(selectRouterParams)
      .pipe(
        map(params => ({key: decodeURIComponent(params?.artifactId), mode: params?.mode})),
        filter(artifactId => !!artifactId),
        distinctUntilChanged()
      );
  }

  ngOnInit() {
    this.artifactSubscription = combineLatest([this.artifactKey$, this.modelInfo$])
      .pipe(filter(([artifactKey, modelInfo]) => !!(artifactKey && artifactKey.key) && !!modelInfo))
      .subscribe(([artifactKey, modelInfo]) => {
        this.selectedArtifact = modelInfo.artifacts.find(artifact => (artifact.key === artifactKey.key && artifact.mode === artifactKey.mode));
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    if (this.artifactSubscription) {
      this.artifactSubscription?.unsubscribe();
    }
  }

}
