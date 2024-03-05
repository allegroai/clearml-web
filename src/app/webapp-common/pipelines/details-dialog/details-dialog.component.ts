import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import {
  updatePipeline,
} from "../pipelines.actions";
@Component({
  selector: 'sm-details-dialog',
  templateUrl: './details-dialog.component.html',
  styleUrls: ['./details-dialog.component.scss']
})
export class DetailsDialogComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer;
  @Input() pipelineId: string;
  @Input() pipelineData: any;
  currentTab: 'parameter' | 'code' = 'parameter'; // Default tab
  isMaximized: boolean = false;
  isDrawerClosing: boolean = false;
  pipelineParameters: string = '';
  pipelineCode: string = '';
  parameterValue!: string;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.pipelineParameters = this.pipelineData?.parameters;
    this.pipelineCode = '';
  }

  openDetailsDrawer(): void {
    this.drawer.open();
  }

  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
  }

  close(): void {
    this.isDrawerClosing = true;
    this.drawer.close();
    this.isMaximized = false;
    setTimeout(() => {
      this.isDrawerClosing = false; 
    }, 50);
  }

  toggleTab(tab: 'parameter' | 'code'): void {
    this.currentTab = tab;
  }

  onInputChange(newValue: any, parameter: any): void {
    // Update the parameter value when the input changes
    this.parameterValue = newValue;
  }
  updateParameterValue(parameter: any): void {
    // Perform deep clone to avoid mutating original object
    const updatedPipelineData = cloneDeep(this.pipelineData);
  
    // Find the index of the parameter in the parameters array
    const index = updatedPipelineData.parameters.findIndex(p => p.id === parameter.id);
  
    // Update the parameter value if found
    if (index !== -1) {
      updatedPipelineData.parameters[index].value = this.parameterValue;
    }  
    // Dispatch action to update pipeline data in the store
    this.store.dispatch(updatePipeline({ changes: updatedPipelineData }));
  }
  
}
