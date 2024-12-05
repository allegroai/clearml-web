import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearInstalledPackgesDialogComponent } from './clear-installed-packages-dialog.component';

describe('ClearInstalledPackgesDialogComponent', () => {
  let component: ClearInstalledPackgesDialogComponent;
  let fixture: ComponentFixture<ClearInstalledPackgesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearInstalledPackgesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearInstalledPackgesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
