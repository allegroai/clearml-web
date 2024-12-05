import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasSelected',
  standalone: true
})
export class HasSelectedPipe implements PipeTransform {

  transform(selectedMetrics: Record<string, boolean>, metric: string): unknown {
    return Object.keys(selectedMetrics).includes(metric);
  }
}
