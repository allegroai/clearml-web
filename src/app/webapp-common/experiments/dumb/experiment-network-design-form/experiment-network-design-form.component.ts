import {Component, Input, ViewChild} from '@angular/core';

@Component({
  selector   : 'sm-experiment-network-design-form',
  templateUrl: './experiment-network-design-form.component.html',
  styleUrls  : ['./experiment-network-design-form.component.scss'],
})
export class ExperimentNetworkDesignFormComponent {

  @ViewChild('networkDesign', {static: true}) networkDesign: HTMLTextAreaElement;

  @Input() formData: any;
  @Input() editable: boolean;
}



