import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownCheatSheetDialogComponent } from './markdown-cheat-sheet-dialog.component';

describe('MarkdownCheatSheetDialogComponent', () => {
  let component: MarkdownCheatSheetDialogComponent;
  let fixture: ComponentFixture<MarkdownCheatSheetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkdownCheatSheetDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkdownCheatSheetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
