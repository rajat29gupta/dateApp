import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { RegisterService } from '../user.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { routerNgProbeToken } from '@angular/router/src/router_module';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload';
import { StringifyOptions } from 'querystring';

const customURL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  model: any = {};
  // user: User;
  username: string;
  baseUrl = 'http://localhost:3000/';

  registerForm: FormGroup; // Reactive Forms
  @Output() cancelRegister = new EventEmitter();
  public uploader: FileUploader = new FileUploader({
    url: customURL,
    itemAlias: 'photo'
  });
  constructor(
    private router: Router,
    private rs: RegisterService,
    private fb: FormBuilder,
    public http: Http
  ) {}

  ngOnInit() {
    this.createRegisterForm();
  }
  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        gender: ['male'], // because it is a radio button I need to supply some default values...
        username: ['', Validators.required],
        knownAs: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(8)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      { validator: this.passwordMatchValidator }
    );
  }
  passwordMatchValidator(g: FormGroup) {
    // return g.get('password').value === g.get('confirmPassword').value ? null : { 'mismatch': true }
  }

  register(value: any) {
    console.log(value);
    this.rs.register(value).subscribe(result => {
      console.log('rec ' + result);
      this.router.navigate(['/dashboard']);
    });
    // this.authService.register(this.model).subscribe(() => {
    //   this.alertify.success('Registration successful');
    // }, error => {
    //   this.alertify.error(error);
    // });
  }
  FileSubmit() {
    console.log();
    if (sessionStorage.getItem('currentUser') != null) {
      // this.currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

      this.username = this.registerForm.get('username').value;
      console.log('Username in filesubmit ' + this.username);
      const add = this.baseUrl + 'usernmeinfo';
      this.http.post(add, { Username: this.username })
        .subscribe((res: Response) => {
          console.log('res ' + res);
        });
    }
    // console.log("user " + this.username);
  }
  cancel() {
    this.cancelRegister.emit(false);
  }
}
