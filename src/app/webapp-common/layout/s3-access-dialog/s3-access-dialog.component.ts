import {Component, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {AdminService} from '~/shared/services/admin.service';
import {FormBuilder, FormControl, FormGroup, NgForm} from '@angular/forms';
import {EventEmitter} from '@angular/core';

@Component({
  selector   : 'sm-s3-access-dialog',
  templateUrl: './s3-access-dialog.component.html',
  styleUrls  : ['./s3-access-dialog.component.scss']
})
export class S3AccessDialogComponent implements OnChanges {
  @ViewChild('S3NGForm', {static: true}) S3NGForm: NgForm;

  public S3Form;
  @Input() isAzure;
  @Input() key;
  @Input() secret                          = '';
  @Input() region                          = '';
  @Input() bucket;
  @Input() endpoint;
  @Input() editMode                        = false;
  @Input() header;

  @Output() closeCancel: EventEmitter<any> = new EventEmitter();
  @Output() closeSave: EventEmitter<any>   = new EventEmitter<any>();
  @Input() saveEnabled = true;
  public formIsSubmitted: boolean;


  constructor(public adminService: AdminService, private formBuilder: FormBuilder) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.S3Form= {
        Key     : changes.isAzure.currentValue ? 'azure' : changes.key.currentValue,
        Secret  : changes.secret.currentValue,
        Region  : changes.region.currentValue,
        Bucket  : changes.bucket.currentValue,
        Endpoint: (changes.endpoint.currentValue === null || changes.endpoint.currentValue?.startsWith('http')) ?
          changes.endpoint.currentValue:
           `http${(changes.endpoint.currentValue as string).endsWith('443') ? 's' : ''}://${changes.endpoint.currentValue}`,
      };
    }
  }


  public saveNewCredentials() {
    this.formIsSubmitted = true;
    if (this.S3NGForm.invalid) {
      return false;
    } else {
      this.closeSave.emit(this.S3Form);
    }

  }

  public cancel() {
    this.closeCancel.emit(this.S3Form);
  }

}
