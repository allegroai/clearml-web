import {ChangeDetectionStrategy, Component, Input, ChangeDetectorRef, ViewContainerRef, ViewChild, AfterViewInit} from '@angular/core';
import {ImmutableFormField} from '../immutableFormField';

@Component({
  selector       : 'sm-textarea-control',
  templateUrl    : './textarea-control.component.html',
  styleUrls      : ['./textarea-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TextareaControlComponent extends ImmutableFormField implements AfterViewInit {

  @Input() rows: number = 12;
  @ViewChild('group', {read: ViewContainerRef, static: true}) groupRef: ViewContainerRef;
  public textHeight = 200;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit() {
    this.onResize();
  }

  onResize() {
    this.textHeight = Math.max(this.groupRef.element.nativeElement.offsetHeight - 20, 45);
    this.cdr.detectChanges();
  }
}
