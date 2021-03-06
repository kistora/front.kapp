import { Injectable} from '@angular/core';
import 'rxjs/add/operator/toPromise';
import {Subject} from "rxjs/Subject";
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { environment } from '../environments/environment';
import { User } from "app/User";

import { ServerMessage } from './ServerMessage';

@Injectable()
export class UserService{

  private apiUrl = environment.apiUrl;
  private loggedIn = new Subject<boolean>();
  loggedIn$ = this.loggedIn.asObservable();
  private right = new Subject<string>();
  right$ = this.right.asObservable();
 
  constructor (private http: Http) {}

  connect (username: String, password: String): Promise<ServerMessage> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.post(this.apiUrl+"/users/login",{ username, password }, options)
    .toPromise()
    .then(this.extractData)
    .then(body => {
      if(body.code === "ok") {
        this.loggedIn.next(true);
        this.right.next(body.message);
      } else {
        this.loggedIn.next(false);
        this.right.next();
      }
      let response = new ServerMessage();
      response.code = body.code;
      response.message = body.message;
      return response;
    })
    .catch(this.handleError);
  }

  add(user: User): Promise<ServerMessage> {
    console.log(user);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.post(this.apiUrl+"/users", JSON.stringify(user), options)
    .toPromise()
    .then(this.extractData)
    .then(body => {
      let response = new ServerMessage();
      response.code = body.code;
      response.message = body.message;
      return response;
    })
    .catch(this.handleError);
  }

  whoAmI(){
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.get(this.apiUrl+"/users/me", options)
    .toPromise()
    .then(this.extractData)
    .then(body => {
      if(body.code === "ok") {
        this.loggedIn.next(true);
        this.right.next(body.message);
      } else {
        this.loggedIn.next(false);
        this.right.next();
      }
      let response = new ServerMessage();
      response.code = body.code;
      response.message = body.message;
      return response;
    })
    .catch(this.handleError);
  }

  logout(): Promise<ServerMessage>{
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this.http.post(this.apiUrl+"/users/logout", {}, options)
    .toPromise()
    .then(this.extractData)
    .then(body => {
      this.loggedIn.next(false);
      let response = new ServerMessage();
      response.code = body.code;
      response.message = body.message;
      return response;
    })
    .catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return  body || {};
  }
 
  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
  }
}
