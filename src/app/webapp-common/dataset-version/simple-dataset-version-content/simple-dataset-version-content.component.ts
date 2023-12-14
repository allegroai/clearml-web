import {ChangeDetectionStrategy, Component, Input, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {fileSizeConfigStorage, FileSizePipe} from '@common/shared/pipes/filesize.pipe';

@Component({
  selector: 'sm-simple-dataset-version-content',
  templateUrl: './simple-dataset-version-content.component.html',
  styleUrls: ['./simple-dataset-version-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleDatasetVersionContentComponent {
  public columns: ISmCol[];
  public tableData: string[][];
  public command: string;
  private ngFile = new FileSizePipe();

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  copySuccess: boolean;

  @Input() set id(id: string) {
    this.command = `clearml-data get --id ${id}`;
    this.copySuccess = false;
  }

  @Input() set data(csv: string) {
    const lines = csv?.split('\n') ?? [];
    const header = lines.splice(0, 1)[0] ?? '';
    this.columns = header.split(/, ?/).map((caption, index) => ({
      id: `${index}`,
      header: caption,
      style: {width: index === 1 ?  '5px' : '300px'}
    }));
    const tableData = lines.map(line => line.split(/, ?/));
    if (Number(tableData[0]?.[1]) && this.columns[1]?.header?.includes('ize')) {
      tableData.forEach( line => line[1] = this.ngFile.transform(parseInt(line[1], 10) || 0, fileSizeConfigStorage) as string);
    }
    this.tableData = tableData;

  }

  openMenu() {
    this.trigger.openMenu();
  }

  copied() {
    this.copySuccess = true;
    window.setTimeout(() => this.copySuccess = false, 3000);
  }
}
