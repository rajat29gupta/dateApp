import { Component, EventEmitter, OnInit, Input, Output } from "@angular/core";
import { RegisterService } from "../user.service";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from "@angular/forms";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  model: any = {};
  // user: User;
  registerForm: FormGroup; //Reactive Forms
  @Output() cancelRegister = new EventEmitter();

  constructor(private rs: RegisterService, private fb: FormBuilder) {}

  ngOnInit() {
    this.createRegisterForm();
  }
  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        // gender: ['male'], //because it is a radio button I need to supply some default values...
        username: ["", Validators.required],
        // knownAs: ['', Validators.required],
        // dateOfBirth: [null, Validators.required], //because it's date field initiall value will be null
        // city: ['', Validators.required],
        // country: ['', Validators.required],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(8)
          ]
        ]
        // confirmPassword: ['', Validators.required]
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
      console.log("rec " + result);
    });
    // this.authService.register(this.model).subscribe(() => {
    //   this.alertify.success('Registration successful');
    // }, error => {
    //   this.alertify.error(error);
    // });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
