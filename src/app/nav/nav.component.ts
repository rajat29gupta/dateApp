import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  constructor() { }

  ngOnInit() {
    // this.authService.currentPhotoUrl.subscribe(model => this.photoUrl = model);

  }
  login() {
    // this.authService.login(this.model).subscribe(data => {

    //   this.alertify.success('logged in successfully');
    // }, error =>{
    //   this.alertify.error('Invalid credentials');
    // }, () => {      //after observable is complited, lets use anonumus function
    //   this.router.navigate(['/members']);
    // });
  }

  logout() {
    // this.authService.userToken = null;
    // this.authService.currentUser = null;
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    // this.alertify.message('logged out!');
    // this.router.navigate(['/home']);
  }

  loggedIn() {
    // return this.authService.loggedIn();
  }


}
