import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

interface SyncScrollData {
  scrollTop: number;
  scrollLeft: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncScrollService {

  private scrollSubject: Subject<SyncScrollData> = new Subject();
  private timer: NodeJS.Timer;
  public  originalTarget: EventTarget;

  setScroll(scroll: SyncScrollData) {
    this.scrollSubject.next(scroll);
  }

  getScroll(): Observable<SyncScrollData> {
    return this.scrollSubject.asObservable();
  }

  updateOriginalTarget(target: EventTarget) {
    this.originalTarget = this.originalTarget || target;
    clearInterval(this.timer);
    this.timer = setTimeout( () => this.originalTarget = null, 200);
  }
}
