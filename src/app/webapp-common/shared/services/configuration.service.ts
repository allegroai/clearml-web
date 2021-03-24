import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {delay, retryWhen, take} from 'rxjs/operators';
import {Environment} from '../../../../environments/base';


@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  public static globalEnvironment = environment as Environment;
  public globalEnvironmentObservable = new BehaviorSubject(environment as Environment);

  constructor(private httpClient: HttpClient,) {
  }

  initConfigurationService() {
    this.httpClient.get('/configuration.json')
      .pipe(retryWhen(errors => errors.pipe(delay(500), take(5))))
      .subscribe(env => {
        ConfigurationService.globalEnvironment = {...ConfigurationService.globalEnvironment, ...env};
        this.globalEnvironmentObservable.next(ConfigurationService.globalEnvironment);
      });
  }

  // If someone must have it the rxjs way
  getEnvironment() {
    return this.globalEnvironmentObservable.asObservable();
  }

  getStaticEnvironment() {
    return ConfigurationService.globalEnvironment;
  }
}
