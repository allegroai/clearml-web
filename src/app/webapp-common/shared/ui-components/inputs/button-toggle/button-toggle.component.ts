import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector       : 'sm-button-toggle',
  templateUrl    : './button-toggle.component.html',
  styleUrls      : ['./button-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleComponent implements OnInit {

  public formControl = new FormControl();
  private valueChangesSubs: any;

  @Input() options: Array<{ value: any; label: string; icon?: string }>;

  @Input() set value(value: any) {
    this.formControl.setValue(value);
  }

  @Output() valueChanged = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
    this.valueChangesSubs = this.formControl.valueChanges
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.valueChanged.emit(value);
      });
  }

}
