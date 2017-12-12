import { any } from 'codelyzer/util/function';
import { LocalDataSource } from 'ng2-smart-table';
import { DayEndService } from '../../day-end.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/user.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
    templateUrl: './mobile-day-end.component.html',
    styleUrls: ['./day-end.component.scss'],
})
export class DayEndComponent implements OnInit {
    filter: any = {};

    trips: any = [];
    branches: Array<any> = [];
    distributors: Array<any> = [];
    logedInUser: any = {};
    todaysDate: any;
    totalCreditAmount: any = 0;
    showBranchDropdown: boolean = false;

    userSubTitle: string = '';
    showSpinner: boolean = false;
    constructor(private service: DayEndService, private userService: UserService,
        protected notification: NotificationsService) { }

    ngOnInit() {
        const now = new Date();
        this.todaysDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
        this.logedInUser = this.userService.getUser();
        console.log(this.logedInUser);
        this.filter = this.service.getFilter();
        if (this.logedInUser.IsDistributor) {
            this.userSubTitle = ` - ${this.logedInUser.Distributor.DistributorName}`;
            this.filter.type = 'distributor';
            this.filter.userBranch = this.logedInUser.Distributor.DistributorMasterId || this.logedInUser.Distributor.DistributorMasterID;
        } else {
            this.filter.type = 'internal';
        }

        if (this.logedInUser.Role.RoleID === 3 && this.logedInUser.IsSeasonal) {
            this.filter.type = 'internal';
            this.logedInUser.IsRIInternal = true;
            this.logedInUser.IsDistributor = false;
        }
        //Check if LogedIn User is Seasonal Distributor or not 

        // if (!this.logedInUser.IsRIInternal) {
        //     if (this.logedInUser.Role.RoleID === 3) {
        //         if (this.logedInUser.IsSeasonal) {
        //             this.showBranchDropdown = true;
        //         } else {
        //             this.showBranchDropdown = false;
        //         }
        //     }
        // }


        this.selectionchangeHandler();
        //for(let i=0;i<this.trips.length;i++)
    }

    selectionchangeHandler() {
        this.loadFilteredTrips();
    }

    loadFilteredTrips() {
        this.totalCreditAmount = 0;
        this.showSpinner = true;
        this.trips = [];
        this.service.getTrips(this.service.formatDate(this.filter.selectedDate)).subscribe((res) => {
            let distributors = [],
                branches = [];
            this.trips = res.Trips || [];
            console.log(this.trips);
            let tmpDist = {};
            let tmpBranch = {};
            this.trips.forEach((trip) => {
                if (this.logedInUser && this.logedInUser.IsSeasonal && this.logedInUser.Role.RoleID === 3) {
                    trip.isDistributor = 0;
                }
                if (trip.isDistributor) {
                    if (tmpDist[trip.DistributorMasterID]) { return; }
                    distributors.push({
                        value: trip.DistributorMasterID,
                        label: trip.DistributorName
                    })
                    tmpDist[trip.DistributorMasterID] = trip.DistributorMasterID;
                    return;
                }
                if (tmpBranch[trip.BranchID]) { return; }
                branches.push({
                    value: trip.BranchID,
                    label: trip.BranchName
                })
                tmpBranch[trip.BranchID] = trip.BranchID;
            })

            branches.unshift({ value: 1, label: 'All Branches' });
            distributors.length && distributors.unshift({ value: 1, label: 'All Distributors' });
            this.distributors = distributors;
            this.branches = branches;
            // if (this.filter.userBranch) {
            //     this.filter.userBranch = 1;
            // }

            // Hack for displaying Distributor in case of no data return
            if (this.logedInUser.IsDistributor && !this.distributors.length) {
                this.distributors = [{
                    value: this.logedInUser.Distributor.DistributorMasterId,
                    label: this.logedInUser.Distributor.DistributorNumber + '-' + this.logedInUser.Distributor.DistributorName
                }]
            }
            this.showSpinner = false;
            // console.log(this.trips);
            // for(let i=0;i<this.trips.length;i++){
            //     if(this.trips[i].IsClosed==false ){
            //         for(let j=0;j<this.trips[i].TripTicketList.length;j++){
            //             if(this.trips[i].TripTicketList[j].CreditCardAmount){
            //                 this.totalCreditAmount = this.totalCreditAmount + this.trips[i].TripTicketList[j].CreditCardAmount;
            //                 this.trips[i].TripTotalAmount=this.trips[i].TripTotalAmount-this.totalCreditAmount;
            //             }
            //         }
            //     }

            // }
        },
            (error) => {
                this.showSpinner = false;
                if (error) {

                    this.notification.error('', 'Something went wrong while fetching data');
                }
            }, );
    }
}
