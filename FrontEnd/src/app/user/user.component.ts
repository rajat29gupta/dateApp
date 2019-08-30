import { Component, OnInit } from '@angular/core';
import { SurveyList } from "../surveylist";
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  surveylist: SurveyList[];
  constructor() { }

  ngOnInit() {

  }

}
