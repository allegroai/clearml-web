import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ExtFrame} from '../single-graph/plotly-graph-base';

@Component({
  selector: 'sm-graph-displayer',
  templateUrl: './graph-displayer.component.html',
  styleUrls: ['./graph-displayer.component.scss']
})
export class GraphDisplayerComponent implements OnInit, AfterViewInit {
  @ViewChild('singleGraph') singleGraph;
  public chart: ExtFrame;
  public id: string;
  public xAxisType: any;
  public darkTheme: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { chart: ExtFrame; id: string; xAxisType: any; darkTheme: boolean }, public dialogRef: MatDialogRef<GraphDisplayerComponent>,
  ) {
    this.chart = data.chart;
    this.id = data.id;
    this.xAxisType = data.xAxisType;
    this.darkTheme = data.darkTheme;
  }


  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.singleGraph.drawGraph(true);
  }

  closeGraphDisplayer() {
    this.dialogRef.close();
  }
}
