import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzureStorageCredentialsComponent } from './azure-storage-credentials.component';

describe('AzureStorageCredentialsComponent', () => {
  let component: AzureStorageCredentialsComponent;
  let fixture: ComponentFixture<AzureStorageCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AzureStorageCredentialsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AzureStorageCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
