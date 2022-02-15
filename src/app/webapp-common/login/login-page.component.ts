import { Component, OnInit } from '@angular/core';
import {mobilecheck} from '../shared/utils/mobile';
import {CommercialContext, Environment} from '../../../environments/base';
import {ConfigurationService} from '@common/shared/services/configuration.service';

@Component({
  selector: 'sm-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  public mobile: boolean;
  public commercialContext: CommercialContext;
  public environment: Environment;


  constructor() {
    this.mobile = mobilecheck();
  }

  ngOnInit(): void {
    this.environment = ConfigurationService.globalEnvironment;
    this.commercialContext = ConfigurationService.globalEnvironment.communityContext;

  }

  acknowledge() {
    this.mobile = false;
  }

}
