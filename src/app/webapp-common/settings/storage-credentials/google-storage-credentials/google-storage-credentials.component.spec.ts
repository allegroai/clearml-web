import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleStorageCredentialsComponent } from './google-storage-credentials.component';

describe('AzureStorageCredentialsComponent', () => {
  let component: GoogleStorageCredentialsComponent;
  let fixture: ComponentFixture<GoogleStorageCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleStorageCredentialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleStorageCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
