import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'sm-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {

  @Output() dismiss = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit(): void {
  }

  navigate(event: MouseEvent) {
    const a = document.createElement('a');
    a.href = 'https://allegro.ai/lp/trains-user-survey/';
    a.target = '_blank';
    this.dismiss.emit(true);
    a.click();
    event.preventDefault();
  }
}
