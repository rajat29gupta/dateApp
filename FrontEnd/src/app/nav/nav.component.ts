import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from "../user.service";

import { MatSnackBar } from "@angular/material";
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  constructor( private router: Router,  private rs: RegisterService,    public snackBar: MatSnackBar) { }

  ngOnInit() {
    // this.authService.currentPhotoUrl.subscribe(model => this.photoUrl = model);

  }
  login(value:any)
  {
    console.log(value)
    this.rs.loginForm(value.username, value.password).subscribe(result => {
      if (result == null) {
        this.openSnackBar(
          "The account does not exist or the password is incorrect."
        );
      } else {
        this.openSnackBar(
          "Success"
        );
        this.router.navigate(["/dashboard"]);

        // this.rs.emailverify(result['email']).subscribe(a => {
        //   if (a == null) {
        //     swal("Error!", "Please verify your email to continue", "error");
        //   } else {
        //     if (result["dappUrl"] == "dappUrl") {
        //       if (result["profile"] === "dApp_creator") {
        //         this.rs.login(result);
        //         if (this.folderCreate) {
        //           const Toast = swal.mixin({
        //             toast: true,
        //             position: 'top-end',
        //             showConfirmButton: false,
        //             timer: 3000
        //           });

        //           Toast({
        //             type: 'success',
        //             title: 'Signed in successfully'
        //           })
        //           this.router.navigate(["/fexplore"]);
        //         } else {
        //           const Toast = swal.mixin({
        //             toast: true,
        //             position: 'top-end',
        //             showConfirmButton: false,
        //             timer: 3000
        //           });

        //           Toast({
        //             type: 'success',
        //             title: 'Signed in successfully'
        //           })
        //           this.router.navigate(["/cod"]);
        //         }
        //       } else {
        //         const Toast = swal.mixin({
        //           toast: true,
        //           position: 'top-end',
        //           showConfirmButton: false,
        //           timer: 3000
        //         });

        //         Toast({
        //           type: 'success',
        //           title: 'Signed in successfully'
        //         })
        //         this.rs.login(result);
        //         this.router.navigate(["/cod"]);
        //       }
        //     } else {
        //       const Toast = swal.mixin({
        //         toast: true,
        //         position: 'top-end',
        //         showConfirmButton: false,
        //         timer: 3000
        //       });

        //       Toast({
        //         type: 'success',
        //         title: 'Signed in successfully'
        //       })
        //       this.rs.login(result);
        //       this.router.navigate(["/dashboard"]);
        //     }
        //   }
        // });
        // window.location.reload();
      }
    });
    // this.authService.login(this.model).subscribe(data => {

    //   this.alertify.success('logged in successfully');
    // }, error =>{
    //   this.alertify.error('Invalid credentials');
    // }, () => {      //after observable is complited, lets use anonumus function
    //   this.router.navigate(['/members']);
    // });
  }
  openSnackBar(message: string) {
    this.snackBar.open(message)._dismissAfter(2000);
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
