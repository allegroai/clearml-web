import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {get} from 'lodash/fp';
import {ALLEGRO_TUTORIAL_BUCKET} from '../../../../app.constants';
import {debounceTime} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import { ICONS } from '../../../constants';

@Component({
  selector   : 'sm-s3-access',
  templateUrl: './s3-access.component.html',
  styleUrls  : ['./s3-access.component.scss']
})
export class S3AccessComponent implements OnDestroy, OnInit {
  readonly ALLEGRO_TUTORIAL_BUCKET = ALLEGRO_TUTORIAL_BUCKET;
  readonly BUCKET_CREDENTIALS      = 'bucketCredentials';
  public S3Form: FormGroup;
  public ICONS                     = ICONS;
  private formChangeSubscription: Subscription;

  @Input() set s3bucketCredentials(s3bucketCredentials) {
    this.formChangeSubscription && this.formChangeSubscription.unsubscribe();
    this.buildS3Form(s3bucketCredentials);
    this.formChangeSubscription = this.S3Form.valueChanges.pipe(debounceTime(300)).subscribe(formData => {
      this.saveCredentials(this.S3Form.getRawValue());
      this.disableTutorialBucket();
    });
  };

  @Output() s3bucketCredentialsChanged = new EventEmitter();

  constructor(private store: Store<any>, private formBuilder: FormBuilder) {
  }

  get bucketCredentials(): FormArray {
    return this.S3Form.get(this.BUCKET_CREDENTIALS) as FormArray;
  }

  addBucket({Key = '', Secret = '', Region = '', Bucket = '', Endpoint = null} = {}) {
    this.bucketCredentials.push(this.formBuilder.group({
      Key,
      Secret,
      Region,
      Bucket,
      Endpoint: (Endpoint?.startsWith('http') || Endpoint === null)? Endpoint : `http${Endpoint?.endsWith('443') ? 's' : ''}://${Endpoint}`

  }));
  }

  removeBucket(index) {
    this.bucketCredentials.removeAt(index);
  }

  private buildS3Form(S3Credentials) {
    this.S3Form = this.formBuilder.group({
      bucketCredentials: this.formBuilder.array([]),
    });

    if (get('bucketCredentials.length', S3Credentials)) {
      S3Credentials.bucketCredentials.forEach(bucket => {
        this.addBucket(bucket || {});
      });
    }

    this.disableTutorialBucket();
  }

  public trackByFn(index, item) {
    return index;
  }

  public saveCredentials(formData) {
    this.s3bucketCredentialsChanged.emit(formData);
  }

  public disableTutorialBucket() {
    const tutorialBucketIndex = this.S3Form.get(this.BUCKET_CREDENTIALS).value.findIndex(cre =>
      cre.Bucket === this.ALLEGRO_TUTORIAL_BUCKET);
    if (tutorialBucketIndex >= 0) {
      this.S3Form.get(this.BUCKET_CREDENTIALS).get(tutorialBucketIndex.toString()).disable();
    }
  }

  ngOnDestroy(): void {
    this.formChangeSubscription.unsubscribe();
  }

  ngOnInit(): void {
  }
}
