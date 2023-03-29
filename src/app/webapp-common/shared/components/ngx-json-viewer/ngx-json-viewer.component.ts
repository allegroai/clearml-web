import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

export interface Segment {
  key: string;
  value: any;
  type: undefined | string;
  description: string;
  expanded: boolean;
  found?: boolean;
}

@Component({
  selector: 'ngx-json-viewer',
  templateUrl: './ngx-json-viewer.component.html',
  styleUrls: ['./ngx-json-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxJsonViewerComponent {

  @Input() set json(json: any) {
    this.segments = [];
    if (json) {
      this.isArray = Array.isArray(json);
      if (typeof json === 'object') {
        Object.keys(json).forEach(key => {
          this.segments.push(this.parseKeyValue(key, json[key]));
        });
      } else {
        this.segments.push(this.parseKeyValue(`(${typeof json})`, json));
      }
    }
  }

  @Input() expanded;
  get search() {
    return this._search;
  }
  @Input() set search(val: string) {
    this._search = val;
    this.segments.forEach(segment => {
      segment.found = !!val && segment.description.includes(val);
    });
  }
  @Input() testLink?: (str: string) => boolean;
  @Output() linkAction = new EventEmitter<string>();

  private _search: string = null;
  segments: Segment[] = [];
  public isArray: boolean;
  public indexes: number[] = [];
  public index: number = 0;
  public stringify = JSON.stringify;

  isExpandable(segment: Segment) {
    return segment.type === 'object' || segment.type === 'array';
  }

  toggle(segment: Segment) {
    if (this.isExpandable(segment)) {
      segment.expanded = !segment.expanded;
    }
  }

  private parseKeyValue(key: any, value: any): Segment {
    const segment: Segment = {
      key,
      value,
      type: undefined,
      description: '' + value,
      expanded: this.expanded
    };

    switch (typeof segment.value) {
      case 'number': {
        segment.type = 'number';
        break;
      }
      case 'boolean': {
        segment.type = 'boolean';
        break;
      }
      case 'function': {
        segment.type = 'function';
        break;
      }
      case 'string': {
        if (this.testLink !== undefined && this.testLink(segment.value)) {
          segment.type = 'link';
          segment.description = segment.value;
        } else {
          segment.type = 'string';
          segment.description = '"' + segment.value + '"';
        }
        break;
      }
      case 'undefined': {
        segment.type = 'undefined';
        segment.description = 'undefined';
        break;
      }
      case 'object': {
        // yea, null is object
        if (segment.value === null) {
          segment.type = 'null';
          segment.description = 'null';
        } else if (Array.isArray(segment.value)) {
          segment.type = 'array';
          segment.description = 'Array[' + segment.value.length + '] ' + JSON.stringify(segment.value);
        } else if (segment.value instanceof Date) {
          segment.type = 'date';
        } else {
          segment.type = 'object';
          segment.description = 'Object ' + JSON.stringify(segment.value);
        }
        break;
      }
    }

    return segment;
  }

  linkActionWrapper(event: Event, link: string) {
    event.preventDefault();
    this.linkAction.emit(link);
  }

  subsectionAction(link: string) {
    this.linkAction.emit(link);
  }

  split(line: string, search: string) {
    const regex = new RegExp(search, 'gi');
    const match = line.match(regex);
    return line.split(regex).map( (part, i) => [part, match?.[i]]);
  }
}
