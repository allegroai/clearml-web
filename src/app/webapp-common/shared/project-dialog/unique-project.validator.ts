import {Directive, Input} from '@angular/core';
import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors} from '@angular/forms';
import {Observable, of, switchMap} from 'rxjs';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {catchError, delay, map} from 'rxjs/operators';
import {ProjectsGetAllExResponse} from '~/business-logic/model/projects/projectsGetAllExResponse';

@Directive({
  selector: '[smUniqueProjectValidator]',
  providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: UniqueProjectValidator, multi: true}],
  standalone: true
})
export class UniqueProjectValidator implements AsyncValidator {
  @Input() parent: string;

  constructor(private projectsApi: ApiProjectsService) {
  }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (!(control.value?.length > 2)) {
      return null;
    }

    return of(control.value).pipe(
      delay(300),
      switchMap((name: string) => this.projectsApi.projectsGetAllEx({
          name: this.parent ? `${this.parent}/${name}` : name,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          only_fields: ['id']
        }).pipe(
          map((res: ProjectsGetAllExResponse) => res.projects.length === 0 ? null : {uniqueProject: {value: control.value}}),
          catchError(() => of({uniqueProject: {value: control.value}}))
        ),
      )
    );
  }
}


