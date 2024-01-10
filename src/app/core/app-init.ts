import {LoginService} from '~/shared/services/login.service';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {switchMap} from 'rxjs';

export const loadUserAndPreferences = (
  loginService: LoginService,
  confService: ConfigurationService,
): () => Promise<any> => (): Promise<any> => new Promise((resolve) => {
  confService.initConfigurationService()
    .pipe(switchMap(() => loginService.initCredentials()))
    .subscribe(() => loginService.loginFlow(resolve));
});
