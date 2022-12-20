import { TestBed } from '@angular/core/testing';

import { ReportCodeEmbedService } from './report-code-embed.service';
import {LocationStrategy} from '@angular/common';
import {Store} from '@ngrx/store';

describe('ReportCodeEmbedService', () => {
  let service: ReportCodeEmbedService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportCodeEmbedService);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a link with multiple metrics', () => {
    const fakeUrl = 'http://fake-url/';
    const fake =  { getBaseHref: () => fakeUrl };
    service = new ReportCodeEmbedService(store, fake as LocationStrategy);
    expect(service.encode({
      type: 'plot',
      task: '123',
      name: 'test1',
      metrics: ['m1', 'm2']
    })).toMatch(/.*metrics=m1&metrics=m2.*/);
  });
});
