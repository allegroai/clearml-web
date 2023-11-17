import {LoginService} from '~/shared/services/login.service';
import {ConfigurationService} from '@common/shared/services/configuration.service';

export const loadUserAndPreferences = (
  loginService: LoginService,
  confService: ConfigurationService,
): () => Promise<any> => (): Promise<any> => new Promise((resolve) => {
  confService.initConfigurationService().subscribe(() =>
    loginService.initCredentials().subscribe(() => loginService.loginFlow(resolve))
  );
});
