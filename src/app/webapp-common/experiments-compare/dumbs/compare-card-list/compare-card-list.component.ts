import {Component, ContentChild, EventEmitter, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Task} from '../../../../business-logic/model/tasks/task';
import {CompareCardBodyDirective} from '../compare-card-body.directive';
import {CompareCardExtraHeaderDirective} from '../compare-card-extra-header.directive';
import {CompareCardHeaderDirective} from '../compare-card-header.directive';

@Component({
  selector   : 'sm-compare-card-list',
  templateUrl: './compare-card-list.component.html',
  styleUrls  : ['./compare-card-list.component.scss']
})
export class CompareCardListComponent {

  @Input() experiments: Array<Task>;
  @Input() baseExperiment: Task;
  @Output() experimentListChanged = new EventEmitter<Array<Task>>();

  @ContentChild(CompareCardBodyDirective, { read: TemplateRef }) bodyTemplate;
  @ContentChild(CompareCardExtraHeaderDirective, { read: TemplateRef }) extraHeaderTemplate;
  @ContentChild(CompareCardHeaderDirective, { read: TemplateRef }) headerTemplate;

  @ViewChild('detailsContainer', {static: true}) detailsContainer;

  hovered = [];

  constructor() {
  }

  experimentRemoved(experiment: Task) {
    this.experimentListChanged.emit(this.experiments.filter(exp => exp !== experiment));
  }

  setAsBase(experiment: Task) {
    this.detailsContainer.nativeElement.scrollLeft = 0;
    this.reorderExperiments(this.experiments.indexOf(experiment), 0);
  }

  reorderExperiments(prevIndex, currentIndex) {
    const newExperiments = [].concat(this.experiments);
    moveItemInArray(newExperiments, prevIndex, currentIndex);
    this.experimentListChanged.emit(newExperiments);
  }

  drop(e: CdkDragDrop<Array<Task>>) {
    if (e.previousIndex === e.currentIndex) { return; }
    this.reorderExperiments(e.previousIndex, e.currentIndex);
  }

  trackByFn(index, item) {
    return item.id;
  }

  changeHovered(i, val) {
    this.hovered[i] = val;
  }
}
