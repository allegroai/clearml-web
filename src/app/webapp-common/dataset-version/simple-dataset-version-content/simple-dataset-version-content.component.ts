import {ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {fileSizeConfigStorage, FileSizePipe} from '@common/shared/pipes/filesize.pipe';


const columnIds = ['name', 'size', 'hash'];

type Row = { [K in typeof columnIds[number]]: string }

interface RowData extends Row {
  id: string
}

@Component({
  selector: 'sm-simple-dataset-version-content',
  templateUrl: './simple-dataset-version-content.component.html',
  styleUrls: ['./simple-dataset-version-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleDatasetVersionContentComponent {
  private readonly ref = inject(ElementRef);
  public columns: ISmCol[];
  public tableData: RowData[];
  public command: string;
  private ngFile = new FileSizePipe();

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  copySuccess: boolean;
  private colSizes = {} as Record<string, number>;

  @Input() set id(id: string) {
    this.command = `clearml-data get --id ${id}`;
    this.copySuccess = false;
  }

  @Input() set data(csv: string) {
    const lines = csv?.trimEnd().split('\n') ?? [];
    const header = lines.splice(0, 1)[0] ?? '';
    const colWidth = (this.ref.nativeElement.getBoundingClientRect().width - 150) / 2;
    this.columns = header.split(/, ?/)
      .map((caption, index) => {
        const width = this.colSizes?.[columnIds[index]] ? `${this.colSizes[columnIds[index]]}px` : null;
        return {
          id: columnIds[index],
          header: caption,
          style: index === 1 ?
            {width: width ?? '150px'} :
            {
              // maxWidth: width ?? `${colWidth}px`,
              width: width ?? `${colWidth}px`,
            }
        };
      });
    const tableData = lines.map((line, index) => ({
      ...line.split(/, ?/).reduce((acc, val, i) => {
        acc[columnIds[i]] = val;
        return acc;
      }, {} as Row),
      id: `${index}`
    } as RowData));
    if (Number(tableData[0]?.size) && this.columns[1]?.header?.includes('ize')) {
      this.tableData = tableData.map( line => ({
        ...line,
        size: this.ngFile.transform(parseInt(line.size, 10) || 0, fileSizeConfigStorage) as string
      }));
    } else {
      this.tableData = tableData;
    }

  }

  openMenu() {
    this.trigger.openMenu();
  }

  copied() {
    this.copySuccess = true;
    window.setTimeout(() => this.copySuccess = false, 3000);
  }

  resizeCol({columnId, widthPx}: {columnId: string, widthPx: number}) {
    this.colSizes[columnId] = widthPx;
    this.columns = this.columns.map(col => col.id === columnId ? {...col, style: {width: widthPx + 'px'}} : col);
  }
}
