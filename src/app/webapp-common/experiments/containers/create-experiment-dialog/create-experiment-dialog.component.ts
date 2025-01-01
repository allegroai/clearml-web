import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
  MatLabel, MatSuffix
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {CodeEditorComponent} from '@common/shared/ui-components/data/code-editor/code-editor.component';
import {shellBinaryValidator} from '@common/shared/validators/shell-binary.validator';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
  uncommited?: string;
  vars: {key: string; value: string}[];
const scriptTypes = ['script', 'module', 'custom_code'] as const;
type ScriptType = typeof scriptTypes[number];
    MatButton,
    MatIconButton,
    MatIcon,
    CodeEditorComponent,
    MatSuffix,
    MatExpansionPanel,
    MatExpansionPanelHeader,
  private codeForm = viewChild<ElementRef<HTMLFormElement>>('codeForm');

  protected filteredQueues = computed(() => this.queueVal() ?
      this.queues()
        .filter(queue => queue.name.toLowerCase().includes(this.queueVal().toLowerCase()) || queue.display_name?.toLowerCase().includes(this.queueVal().toLowerCase())) :
      this.queues()
  );
    repo: [null as string],
    branch: ['master'],
    binaryType: ['python', Validators.required],
    binary: [null as string, Validators.required],
    scriptType: ['script' as ScriptType],
    script: [null as string, Validators.required],
    uncommited: [null as string],
    pip: [''],
    vars: this.formBuilder.array([])
  shell = toSignal(this.codeFormGroup.controls.binaryType.valueChanges
    .pipe(
      debounceTime(300),
      map(value => value === 'shell'),
      distinctUntilChanged(),
    ));
  protected scriptTypes = computed(() => this.shell() ? scriptTypes.filter((e, index) => index !== 1) : scriptTypes);
  protected editMode = signal(false);

    effect(() => {
      if(this.shell()) {
        this.codeFormGroup.controls.binary.setValue('/bin/bash');
        this.codeFormGroup.controls.binary.setValidators([Validators.required, shellBinaryValidator]);
      } else {
        this.codeFormGroup.controls.binary.setValue('python3');
        this.codeFormGroup.controls.binary.setValidators([Validators.required]);
      }
      this.codeFormGroup.controls.binary.updateValueAndValidity();
    });
  get vars() {
    return this.envFormGroup.get('vars') as FormArray;
  }

      ...(this.codeFormGroup.controls.scriptType.value === 'module' && {script: `-m ${this.codeFormGroup.value.script}`}),
      ...(this.shell() && this.codeFormGroup.controls.scriptType.value === 'script' && {script: `-c ${this.codeFormGroup.value.script}`}),
      ...(this.codeFormGroup.controls.scriptType.value === 'custom_code' && this.codeFormGroup.controls.repo.value &&
        {uncommited: this.createDiff(this.codeFormGroup.controls.uncommited.value)}
      ),
  createDiff(file: string) {
    const fileName = this.codeFormGroup.controls.script.value;
    const len = (file?.split('\n').length ?? 0) + 1;

    return `diff --git a/${fileName} b/${fileName}
new file mode 100644
index 000000000..ff86f39a4
--- /dev/null
+++ b/${fileName}
@@ -0,0 +1,${len - 1} @@\n` + (file?.split('\n').map(line => '+' + line).join('\n') ?? '');
  }

  typeChange(value: string) {
    this.gitTypes.forEach(type => {
      if (this.codeFormGroup.controls.repo.value && type === value) {

  addVar() {
    this.vars.push(this.formBuilder.group({
      key: ['', Validators.required],
      value: [''],
    }))
  }

  updateEntryFromFile($event: Event) {
    const file = ($event.target as HTMLInputElement)?.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      this.codeFormGroup.controls.uncommited.setValue(evt.target.result as string);
      if (!this.codeFormGroup.controls.script.value)
      this.codeFormGroup.controls.script.setValue(file.name ?? 'main.py');
    };
    reader.readAsText(file);
  }

  editScript() {
    this.editMode.set(true);
  }

  updateScript(code: string) {
    this.codeFormGroup.controls.uncommited.setValue(code);
    this.editMode.set(false)
    window.setTimeout(() => this.codeForm().nativeElement.scrollTo({top: 1000, behavior: 'smooth'}));
  }

  clearFile() {
    this.codeFormGroup.controls.script.setValue(null);
    this.codeFormGroup.controls.uncommited.setValue(null);
  }