import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsStorageCredentialsComponent } from './aws-storage-credentials.component';

describe('AzureStorageCredentialsComponent', () => {
  let component: AwsStorageCredentialsComponent;
  let fixture: ComponentFixture<AwsStorageCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwsStorageCredentialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwsStorageCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
