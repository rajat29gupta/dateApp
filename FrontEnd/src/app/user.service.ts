// import { Injectable } from '@angular/core';
// import { Http, Headers, RequestOptions, Response } from '@angular/http';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/observable/throw';
// import { Observable } from 'rxjs';
// import { tokenNotExpired, JwtHelper } from 'angular2-jwt';


// @Injectable()
// export class AuthService {
//     baseUrl = 'http://localhost:5000/api/auth/';
//     userToken: any;
//     decodedToken: any;
//     jwtHelper: JwtHelper = new JwtHelper();

//     constructor(private http: Http) { }

//     login(model: any) {
//         return this.http.post(this.baseUrl + 'login', model, this.requestOptions()).map((response: Response) => {
//             const user = response.json();
//             if (user) {
//                 localStorage.setItem('token', user.tokenString);
//                 this.decodedToken = this.jwtHelper.decodeToken(user.tokenString);
//                 console.log(this.decodedToken);
//                 this.userToken = user.tokenString;
//             }
//         }).catch(this.handleError);
//     }

//     // register(model: any) {
//     //     return this.http.post(this.baseUrl + 'register', model, this.requestOptions()).catch(this.handleError);
//     // }

//     register(param: any): Observable<any> {
//       let headers1 = new HttpHeaders({
//         "Content-Type": "application/x-www-form-urlencoded"
//       });

//       var body1 = `objtosave=${JSON.stringify(param)}`;

//       var url2 = `${this.baseUrl}register`;

//       return this.http.post<any>(url2, body1, { headers: headers1 }).pipe(
//         map((result: any) => {
//           if (result.errors) {
//             //  console.log("Error", result.first_error);
//           } else {
//             // this.registerUser = result;
//           }
//           return result;
//         }),
//         catchError(err => {
//           return err.json();
//         })
//       );
//     }

//     loggedIn() {
//         return tokenNotExpired('token');
//     }

//     private requestOptions() {
//         const headers = new Headers({'Content-Type': 'application/json'});
//         return new RequestOptions({headers: headers});
//     }

//     private handleError(error: any) {
//         const applicationError = error.headers.get('Application-Error');
//         if (applicationError) {
//             return Observable.throw(applicationError);
//         }
//         const serverError = error.json();
//         let modelStateErrors = '';
//         if (serverError) {
//             for (const key in serverError) {
//                 if (serverError[key]) {
//                     modelStateErrors += serverError[key] + '\n';
//                 }
//             }
//         }
//         return Observable.throw(
//             modelStateErrors || 'Server error'
//         );
//     }
// }


import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
// import { Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { catchError, map } from "rxjs/operators";
import "rxjs/add/observable/throw";
import { Register } from "./register.model";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Http } from "@angular/http";
// import { SurveySaved } from "../models/surveysaved";
import { Router } from "@angular/router";
// import { environment } from "../../environments/environment";

@Injectable()
export class RegisterService {
  loggedInUser$ = new BehaviorSubject<boolean>(true);
  private showinfo = new BehaviorSubject<boolean>(false);
  cast = this.showinfo.asObservable();
  user: Register;

  subs: string;
  registerUser: Register;
  private baseUrl: string = 'http://localhost:3000/'
  //  environment.baseUrl;
  constructor(private http: HttpClient, private http2: Http) {
    if (sessionStorage.getItem("currentUser") == null) {
      this.loggedInUser$.next(false);
    } else {
      this.loggedInUser$.next(true);
    }
  }

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = error.message
      ? error.message
      : error.status
        ? `${error.status} - ${error.statusText}`
        : "Server error";
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  register(param: Register): Observable<Register> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
// console.log(JSON.stringify(param));
    var body1 = `objtosave=${JSON.stringify(param)}`;

    var url2 = `${this.baseUrl}register`;

    return this.http.post<Register>(url2, body1, { headers: headers1 }).pipe(
      map((result: any) => {
        if (result.errors) {
          //  console.log("Error", result.first_error);
        } else {
          this.registerUser = result;
        }
        return result;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  editUser(newUser) {
    this.showinfo.next(newUser);
  }
  rootinfo(): Observable<any> {
    //console.log("Calling dappBoxStatus");
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    //console.log("dappbox create status " + status);
    // var body1 = `user=${status}`;
    //console.log(body1);
    var url2 = `${this.baseUrl}rootinfo`;
    //console.log(url2);
    return this.http.post<boolean>(url2, { headers: headers1 }).pipe(
      map((result: boolean) => {
        return result;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  /// Update Password through profile section
  updatePass(
    currentPass: string,
    newPass: string,
    email: string
  ): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body1 = `currentPass=${currentPass}&newPass=${newPass}&email=${email}`;
    //the complete url of the POST request on the server
    var url2 = `${this.baseUrl}updatePass`;

    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((res: Register) => {
        //  //console.log('result from udpatePAss: ',res);
        return res;
      }),
      catchError(err => {
        // console.log("Reg WS: ", err);
        return err.json();
      })
    );
  }

  saveImg(user: Register): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body1 = `objtosave=${JSON.stringify(user)}`;
    //the complete url of the POST request on the server
    var url2 = `${this.baseUrl}saveImage`;

    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((res: Register) => {
        //console.log("result from saveImg: ", res);
        return res;
      }),
      catchError(err => {
        //console.log("Reg WS: ", err);
        return err.json();
      })
    );
  }

  dappUrl(dappUrl: string, email: string): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body = `dappUrl=${dappUrl}&email=${email}`;
    //the complete url of the POST request on the server
    var url = `${this.baseUrl}dappUrl`;

    return this.http.post(url, body, { headers: headers1 }).pipe(
      map((res: Register) => {
        // //console.log("result from saveImg: ", res);
        return res;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  chargeDapp(
    token: string,
    email: string,
    price: number,
    description: string
  ): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body = `token=${token}&email=${email}&price=${price}&description=${description}`;
    //the complete url of the POST request on the server
    var url = `${this.baseUrl}chargeDapp`;

    return this.http.post(url, body, { headers: headers1 }).pipe(
      map((res: Register) => {
        // console.log("result from dapp: ", res);
        return res;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  deldetail(email: string): Observable<any> {
    // console.log("deldetail inside");
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body = `email=${email}`;
    //the complete url of the POST request on the server
    var url = `${this.baseUrl}deldetail`;

    return this.http.post(url, body, { headers: headers1 }).pipe(
      map((res: Register) => {
        // //console.log("result from saveImg: ", res);
        return res;
      }),
      catchError(err => {
        // //console.log("Reg WS: ", err);
        return err.json();
      })
    );
  }

  fexplorer(email: string): Observable<any> {
    // console.log("fexplorer inside");
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body = `email=${email}`;
    //the complete url of the POST request on the server
    var url = `${this.baseUrl}fexplorer`;

    return this.http.post(url, body, { headers: headers1 }).pipe(
      map((res: Register) => {
        // //console.log("result from saveImg: ", res);
        return res;
      }),
      catchError(err => {
        // //console.log("Reg WS: ", err);
        return err.json();
      })
    );
  }

  resendVerEmail(param: Register): Observable<Register> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body1 = `objtosave=${JSON.stringify(param)}`;
    var url2 = `${this.baseUrl}resendVerEmail`;
    return this.http.post<Register>(url2, body1, { headers: headers1 }).pipe(
      map((result: any) => {
        if (result.errors) {
        } else {
          this.registerUser = result;
        }
        return result;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  emailverify(email: string): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body = `email=${email}`;
    var url = `${this.baseUrl}emailverify`;

    return this.http.post(url, body, { headers: headers1 }).pipe(
      map((res: Register) => {
        return res;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  getuserdetail(email: string): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body = `email=${email}`;
    var url = `${this.baseUrl}getuserdetail`;

    return this.http.post(url, body, { headers: headers1 }).pipe(
      map((res: Register) => {
        // //console.log("result from saveImg: ", res);
        return res;
      }),
      catchError(err => {
        // //console.log("Reg WS: ", err);
        return err.json();
      })
    );
  }

  createDAppBox(user: string, email: string): Observable<Register> {
    this.getuserdetail(email).subscribe(a => {
      let lk = {
        user_name: "",
        password_hash: "",
        hashing_algorithm: "bcrypt"
      };
      lk.user_name = a[0]["username"];
      lk.password_hash = a[0]["password"];
      let address = this.baseUrl + "dappInfo";
      this.http.post(address, lk).subscribe((res: Response) => {
        // console.log(res);
      });
    });
    // console.log("Calling creating dAppBox");
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    var body1 = `user=${JSON.stringify(user)}&email=${email}`;

    var url2 = `${this.baseUrl}admin/dAppBox/create`;
    return this.http.post<Register>(url2, body1, { headers: headers1 }).pipe(
      map((result: any) => {
        if (result.errors) {
          //console.log("Error", result.first_error);
        }
        return result;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  getdapp(): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    var body1 = ``;
    var url2 = `${this.baseUrl}getdapp`;
    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((result: any) => {
        // //console.log("result "+JSON.stringify(result));
        return result;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  getShort(choice: number, email: string): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    var body1 = `user=${JSON.stringify(choice)}&email=${email}`;
    var url2 = `${this.baseUrl}getshort`;
    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((result: any) => {
        // //console.log("result from getSHORT " + JSON.stringify(result);
        return result;
      }),
      catchError(err => {
        //console.log("err "+JSON.stringify(err));
        return err.json();
      })
    );
  }

  deleteDAppBox(user: string): Observable<Register> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    var body1 = `user=${JSON.stringify(user)}`;
    var url2 = `${this.baseUrl}admin/dAppBox/delete`;
    return this.http.post<Register>(url2, body1, { headers: headers1 }).pipe(
      map((result: any) => {
        if (result.errors) {
          //console.log("Error", result.first_error);
        }
        // console.log('result WS: ',result.result);
        return result;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  loginForm(username: string, password: string): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    // the HTTP header of the POST request send to the WS server
    // headers1.append('Content-Type', 'application/x-www-form-urlencoded');
    //the body of the POST request being send to the server
    var body1 = `username=${username}&password=${password}`;
    //the complete url of the POST request on the server
    var url2 = `${this.baseUrl}login`;

    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((res: Register) => {
        //  console.log('register WS: ',res);
        return res;
      }),
      catchError(err => {
        //console.log("Reg WS: ", err);
        return err.json();
      })
    );
  }

  recovery(pasword: string, confirmPasword: string): Observable<any> {
    //console.log("Calling recovery");
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body1 = `pasword=${pasword}&confirmPasword=${confirmPasword}`;
    //the complete url of the POST request on the server
    var url2 = `${this.baseUrl}recovery`;
    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((res: Register) => {
        return res;
      }),
      catchError(err => {
        //console.log("error: ", err);
        return err.json();
      })
    );
  }

  recoveryValidate(token: string): Observable<any> {
    //console.log("Calling recovery Validate");
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body1 = `token=${token}`;
    //the complete url of the POST request on the server
    var url2 = `${this.baseUrl}recoveryValidate`;
    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((res: Register) => {
        return res;
      }),
      catchError(err => {
        //console.log("error: ", JSON.stringify(err));
        return err.json();
      })
    );
  }

  emailtoken(token: string): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    var body1 = `token=${token}`;
    //the complete url of the POST request on the server
    var url2 = `${this.baseUrl}emailtoken`;
    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((res: Register) => {
        return res;
      }),
      catchError(err => {
        //console.log("error: ", JSON.stringify(err));
        return err.json();
      })
    );
  }
  resetForm(username: string): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    // the HTTP header of the POST request send to the WS server
    // headers1.append('Content-Type', 'application/x-www-form-urlencoded');
    //the body of the POST request being send to the server
    var body1 = `username=${username}`;
    //the complete url of the POST request on the server
    var url2 = `${this.baseUrl}resetEmail`;
    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((res: Register) => {
        return res;
      }),
      catchError(err => {
        // //console.log('Reg WS: ',err);
        return err.json();
      })
    );
  }

  checkLoggedIn(): Observable<boolean> {
    this.user = JSON.parse(sessionStorage.getItem("currentUser"));
    if (this.user == null) {
      this.loggedInUser$.next(false);
    } else {
      this.loggedInUser$.next(true);
    }
    return this.loggedInUser$;
  }

  logout() {
    sessionStorage.removeItem("currentUser");
    this.loggedInUser$.next(false);
  }

  login(user: Register) {
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    this.loggedInUser$.next(true);
  }
  updateUser() {
    sessionStorage.setItem("currentUser", JSON.stringify(this.registerUser));
  }
  validatecheck(): Observable<any> {
    let headers1 = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    var body1 = ``;
    var url2 = `${this.baseUrl}validatecheck`;
    return this.http.post(url2, body1, { headers: headers1 }).pipe(
      map((result: any) => {
        return result;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  acceptLogin() {
    sessionStorage.setItem("currentUser", JSON.stringify(this.registerUser));
    this.loggedInUser$.next(true);
    var s = JSON.parse(sessionStorage.getItem("currentUser"));
    // //console.log("user "+JSON.stringify(s));
  }

  removeRefusedUser(): Observable<Register> {
    sessionStorage.removeItem("currentUser");
    this.loggedInUser$.next(false);

    let headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
    var body = `objtodelete=${JSON.stringify(this.registerUser)}`;
    var url = `${this.baseUrl}deleteUser`;
    return this.http.post<Register>(url, body, { headers: headers }).pipe(
      map((result: any) => {
        if (result.errors) {
          //console.log("Error", result.first_error);
        } else {
          this.registerUser = null;
        }
        return result;
      }),
      catchError(err => {
        return err.json();
      })
    );
  }

  getUser(): Observable<Register> {
    return this.http
      .get<Register>(`/assets/user.json`)
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }
}
