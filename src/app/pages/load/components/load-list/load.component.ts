import { any } from 'codelyzer/util/function';
import { LocalDataSource } from 'ng2-smart-table';
import { LoadService } from '../../load.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/user.service';
import { NotificationsService } from 'angular2-notifications';
import { ActivatedRoute,Router } from '@angular/router';


@Component({
    templateUrl: './load.component.html',
    styleUrls: ['./load.component.scss'],
})
export class LoadComponent implements OnInit {
    filter: any = {};

    loads: any = [];
    maxTripCode: any =0;
    filteredLoads: any = [];
    branches: Array<any> = [];
    allBranches: Array<any> = [];
    drivers: Array<any> = [];
    logedInUser: any = {};
    todaysDate: any;
    selectedDate: any;
    showSpinner: boolean = false;
    loadFilterOption: any = {
        uId: '0',
        loadDate: this.selectedDate,
        branchId: 0,
        branchName: '',
        isForAll: false,
        TripCode: 1,
        DriverName: '',
        DriverID: ''
    };
    constructor(private service: LoadService, private userService: UserService,
        protected notification: NotificationsService,
        protected activatedRoute: ActivatedRoute,protected router: Router ) { }

    ngOnInit() {
        this.retainFilters('reset');
        const now = new Date();
        this.todaysDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
        this.logedInUser = this.userService.getUser();
        this.filter = this.service.getFilter();
        this.filter.tripCode = 0;
        this.branches = this.activatedRoute.snapshot.data['branches'];
        if (this.branches && this.branches.length) {
            if ((this.branches.length > 0) && (this.branches[0] === null || this.branches[0].BranchID === 1)) {
                this.branches.shift();
            }
        }
        this.allBranches = this.service.transformOptionsReddySelect(this.branches, 'BranchID', 'BranchCode', 'BranchName');
        if(this.filter.userBranch && this.filter.userBranch>0){
            this.getDrivers();
        }
        
        this.dateChangeHandler();
        
    }
    getDrivers(byType: any = '') {
        if (this.filter.userBranch === null) {
            return;
        }
         
        this.service.getDriverByBranch(this.filter.userBranch, true).subscribe(res => {
            let objDriver = [];
            res = res || [];
            objDriver = this.service.transformOptionsReddySelect(res, 'UserId', 'UserName');
            this.drivers = objDriver;
            if(this.logedInUser.Role.RoleID === 3){
                this.filter.userDriver = this.logedInUser.UserId;
                this.userChangeHandler();
            }      
        });
        
    }
    branchChangeHandler(byType: any = '') {
        //this.searchObj.UserId = null;
        this.logedInUser.Role.RoleID != 3 && (this.drivers = []);
        this.filteredLoads = [];
        this.filter.userDriver = 0
        this.filter.userDriver = 0;
        this.getDrivers(byType);
    }
    userChangeHandler() {
        this.getBranchName();
        this.getDriverName();
        this.getLoadsFromList(this.filter.userBranch, this.filter.userDriver);
    }
    getBranchName(){
        let b = this.branches.filter((b)=>b.BranchID === this.filter.userBranch);
        this.filter.userBranchName = b[0].BranchCode +' - '+b[0].BranchName;
    }
    getDriverName(){
        let d = this.drivers.filter((d)=>d.value === this.filter.userDriver);
        this.filter.userDriverName = d[0].label;
    }
    getLoadsFromList(branchID, driverID) {

        this.filteredLoads = [];
        let tempLoad = [];
        let fLoad = [];
        this.filter.tripCode = 0;
        if (typeof this.loads === 'object' && this.loads && this.loads.length && this.loads.length > 0) {
            
            this.loads.forEach((load) => {
                if (branchID === load.BranchID && driverID === load.DriverID) {
                    fLoad.push(load);
                }
            });

            this.filter.tripCode = this.getHighestTripCode(fLoad);
        }else{
        
            this.filter.tripCode = 0;
        }
        this.maxTripCode= this.getHighestTripCode(fLoad);
        this.filteredLoads = fLoad.sort((a, b) => Number(b.TripCode) - Number(a.TripCode));
    }
    getHighestTripCode(fLoad) {
        let arr=[];
        fLoad.forEach(function(item){
            arr.push(item.TripCode);
        })
        if(arr.length > 0){
        var max = arr.reduce(function(a, b) {
            return Math.max(a, b);
        });
        } else {
            max = 0;
        }
        return max;
    }
    getLoads() {
        this.service.getLoads(this.service.formatDate(this.filter.selectedDate), null, null, false).subscribe((res) => {
            this.loads = res;
            this.showSpinner = false;
            this.maxTripCode = 0;
            this.filteredLoads = [];
            if (this.filter.userBranch > 0 && this.filter.userDriver > 0){
                this.getLoadsFromList(this.filter.userBranch, this.filter.userDriver);
            }
               
        },
            (error) => {
                this.showSpinner = false;
                if (error) {

                    this.notification.error('', 'Something went wrong while fetching data');
                }
            }
        );
    }

    dateChangeHandler() {
        this.showSpinner = true;
        this.selectedDate = this.service.formatDate(this.filter.selectedDate);
        this.getLoads();

    }
    retainFilters(reset:any =''){
        if(reset!==''){
            if(sessionStorage.getItem("LoadFilter")){
                sessionStorage.removeItem("LoadFilter");
            }
            
        } else {
            sessionStorage.setItem("LoadFilter",JSON.stringify(this.filter));
            
        }
       
    }
    
    goToDetails(loadID){ 
        if(loadID!==''){
            this.filter.LoadID = loadID;
            this.retainFilters('');
            this.router.navigate(['/pages/load/detail',loadID]);
        } else{
            this.retainFilters('');
            this.router.navigate(['/pages/load/detail']);
        }
       
       
        
    }

}
