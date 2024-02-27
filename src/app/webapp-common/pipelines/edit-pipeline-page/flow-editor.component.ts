import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';


import { PipelineFlowComponent } from './react/pipeline-flow.component';
import { Pipeline } from '~/business-logic/model/pipelines/pipeline';



const containerElementName = 'myReactComponentContainer';


@Component({
  selector: 'sm-flow-editor',
  template: `<span #${containerElementName}></span>`,
  styleUrls: ['./flow-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FlowEditorComponent  implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild(containerElementName, {static: false}) containerRef: ElementRef;

  @Input() public pipelineData: Pipeline;
  @Output() nodesChangedInReactFlow = new EventEmitter<Array<unknown>>();
  @Output() edgesChangedInReactFlow = new EventEmitter<Array<unknown>>();
  @Output() nodeClicked = new EventEmitter<unknown>();
  

  /* initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: '1' }, type: "normal" },
    { id: '2', position: { x: 0, y: 100 }, data: { label: '2' },  type: "normal"  },
  ];
  initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]; */

  constructor() {
    //this.handleDivClicked = this.handleDivClicked.bind(this);
    this.nodesDataChanged = this.nodesDataChanged.bind(this);
    this.edgesDataChanged = this.edgesDataChanged.bind(this);
    this.onNodeClicked = this.onNodeClicked.bind(this);
    window.React = React;
  }

  // public handleDivClicked() {
  //   if (this.componentClick) {
  //     this.componentClick.emit();
  //     this.render();
  //   }
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(_changes: SimpleChanges): void {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    if(this.containerRef?.nativeElement)
    ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
  }

  public nodesDataChanged(nodes: Array<unknown>) {
    this.nodesChangedInReactFlow?.emit(nodes)
  }

  public edgesDataChanged(edges: Array<unknown>) {
    this.edgesChangedInReactFlow?.emit(edges)
  }

  public onNodeClicked(nodeData) {
    this.nodeClicked?.emit(nodeData);
  }



  private render() {
    const root = createRoot(this.containerRef.nativeElement);

// https://babeljs.io/repl
    root.render(React.createElement("div", {
      className: 'i-am-classy',
      children: React.createElement(PipelineFlowComponent, {
        initialNodes: this.pipelineData?.flow_display?.nodes,
        initialEdges: this.pipelineData?.flow_display?.edges,
        onNodesDataChanged: this.nodesDataChanged,
        onEdgesDataChanged: this.edgesDataChanged,
        onNodeClicked: this.onNodeClicked,
      })
    }));
  }
 
}
