import {Injectable} from '@angular/core';
import {Resolve} from '@angular/router';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkersAndQueuesResolver implements Resolve<Observable<boolean>> {

  resolve(): Observable<boolean> {
    return of(true);
  }
}
