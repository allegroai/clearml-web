import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageCredentialsComponent } from './storage-credentials.component';

describe('DeleteCredsComponent', () => {
  let component: StorageCredentialsComponent;
  let fixture: ComponentFixture<StorageCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageCredentialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
