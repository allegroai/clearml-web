import {LoginService} from '~/shared/services/login.service';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {combineLatest} from 'rxjs';

export const loadUserAndPreferences = (
  loginService: LoginService,
  confService: ConfigurationService,
): () => Promise<any> => (): Promise<any> => new Promise((resolve) => {
  combineLatest([
    confService.initConfigurationService(),
    loginService.initCredentials()
  ])
    .subscribe(() => loginService.loginFlow(resolve));
});
