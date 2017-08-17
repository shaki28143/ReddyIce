import { UserService } from '../../shared/user.service';
import { Observable } from 'rxjs/Rx';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ResetPasswordService {
    API_ENDPOINT = 'http://frozen.reddyice.com/DPServicesnew/';
    constructor(private http: Http, private userService: UserService) { }

    resetPassword(data: any): Observable<any> {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const options = new RequestOptions({ 'headers': headers });
        return this.http.post(`${this.API_ENDPOINT}api/reset`, data, options).map((res) => res.json());
    }

}