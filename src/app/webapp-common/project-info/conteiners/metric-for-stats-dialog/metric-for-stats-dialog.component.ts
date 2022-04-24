import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';

@Component({
  selector: 'sm-metric-for-stats-dialog',
  templateUrl: './metric-for-stats-dialog.component.html',
  styleUrls: ['./metric-for-stats-dialog.component.scss']
})
export class MetricForStatsDialogComponent {
  public variants: MetricVariantResult[];
  public metricVariantSelection : ISmCol[];

  constructor(
    private matDialogRef: MatDialogRef<MetricForStatsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) {variants, metricVariantSelection}: {variants: MetricVariantResult[]; metricVariantSelection: ISmCol[]}
  ) {
    this.variants = variants;
    this.metricVariantSelection = metricVariantSelection;
  }

  close(selection?) {
    if(selection && !selection.valueType) {
      return;
    }
    this.matDialogRef.close(selection);
  }
}
