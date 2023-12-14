import {AfterViewInit, Directive} from '@angular/core';
import {ResizableColumn} from 'primeng/table';
import {fromEvent, Subscription} from 'rxjs';

@Directive({
  selector: '[smResizableColumn]'
})
export class ResizableColumnDirective extends ResizableColumn implements AfterViewInit{
  private sub: Subscription;

  ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.resizer) {
      this.sub = fromEvent(this.resizer, 'dblclick').subscribe((event: MouseEvent) => {
        const width = this.calcWidth(this.el.nativeElement);
        const delta = width - this.el.nativeElement.offsetWidth;
        this.dt.onColumnResizeBegin(event);
        this.dt.onColumnResize({pageX: event.pageX + delta});
        this.dt.onColumnResizeEnd();
      });
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.sub?.unsubscribe();
  }

  private calcWidth(column: HTMLTableHeaderCellElement) {
    const index = column.cellIndex;
    const table = this.dt;
    const rows = [...table.el.nativeElement.getElementsByTagName('tr')] as HTMLTableRowElement[];

    const dummyContainer = document.createElement('span');
    dummyContainer.style.position = 'fixed';
    // attach the dummy container to our table so all relevant styles will apply to it
    table.el.nativeElement.appendChild(dummyContainer);

    this.cloneItemIntoDummy(column, dummyContainer);
    // add all relevant cells to dummy container
    rows.forEach(row => {
      const cells = row.getElementsByTagName('td');
      if (cells.length > index) {
        this.cloneItemIntoDummy(cells.item(index), dummyContainer);
      }
    });
    // measure and detach container
    const width = dummyContainer.offsetWidth;
    table.el.nativeElement.removeChild(dummyContainer);

    return width;
  }

  private cloneItemIntoDummy(eCell: HTMLElement, eDummyContainer: HTMLElement): void {
    // shamelessly copied from ag-grid
    // make a deep clone of the cell
    const eCellClone: HTMLElement = eCell.cloneNode(true) as HTMLElement;
    // the original has a fixed width, we remove this to allow the natural width based on content
    eCellClone.style.width = '';
    // the original has position = absolute, we need to remove this so it's positioned normally
    eCellClone.style.position = 'static';
    eCellClone.style.left = '';
    // we put the cell into a containing div, as otherwise the cells would just line up
    // on the same line, standard flow layout, by putting them into divs, they are laid
    // out one per line
    const eCloneParent = document.createElement('div');

    // table-row, so that each cell is on a row.
    eCloneParent.style.display = 'table-row';
    eCloneParent.appendChild(eCellClone);
    eDummyContainer.appendChild(eCloneParent);
  }

}
