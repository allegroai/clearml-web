import {Component, OnChanges, Input, Output, EventEmitter} from '@angular/core';

export interface Segment {
  key: string;
  value: any;
  type: undefined | string;
  description: string;
  expanded: boolean;
}

@Component({
  selector: 'ngx-json-viewer',
  templateUrl: './ngx-json-viewer.component.html',
  styleUrls: ['./ngx-json-viewer.component.scss']
})
export class NgxJsonViewerComponent implements OnChanges {

  @Input() json: any;
  @Input() expanded = true;
  /**
   * @deprecated It will be always true and deleted in version 3.0.0
   */
  @Input() cleanOnChange = true;
  @Input() testLink?: (str: string) => boolean;
  @Output() linkAction = new EventEmitter<string>();

  segments: Segment[] = [];

  ngOnChanges() {
    if (this.cleanOnChange) {
      this.segments = [];
    }
    if (this.json) {
      if (typeof this.json === 'object') {
        Object.keys(this.json).forEach(key => {
          this.segments.push(this.parseKeyValue(key, this.json[key]));
        });
      } else {
        this.segments.push(this.parseKeyValue(`(${typeof this.json})`, this.json));
      }
    }

  }

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
      key: key,
      value: value,
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
}
