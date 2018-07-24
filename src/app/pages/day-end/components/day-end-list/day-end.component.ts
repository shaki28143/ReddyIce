import { any } from 'codelyzer/util/function';
import { ActivatedRoute } from '@angular/router';
import { DayEndService } from '../../day-end.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/user.service';
import { NotificationsService } from 'angular2-notifications';
import { forEach } from '@angular/router/src/utils/collection';
import { DayEndPipe } from 'app/pages/day-end/components/day-end-list/day-end-list.pipe';
import { GenericSort } from 'app/shared/pipes/generic-sort.pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { NgModule } from '@angular/core';
import { ModelPopupComponent } from '../../../../shared/components/model-popup/model-popup.component';
import { CacheService } from '../../../../shared/cache.service';

@Component({
    templateUrl: './day-end.component.html',
    styleUrls: ['./day-end.component.scss'],
    providers: [DayEndPipe, GenericSort]
})
export class DayEndComponent implements OnInit {
    filter: any = {};
    customer: any = {sortField: '', isAsc: false};
    trips: any = [];
	  drivers: any[];
	allDrivers: any[];
	refreshSpinner:boolean = false;
	refreshCheck:boolean = false;
	buttonAction:boolean = false;
	refreshCounter:number = 0;
	noDataMessage:string = "";
	refreshMessage:string = "Please click View Trips button to get latest data";
    branches: Array<any> = [];
    distributors: Array<any> = [];
    logedInUser: any = {};
    todaysDate: any;
	refreshTimestamp:string = "";
    totalCreditAmount: any = 0;
    showBranchDropdown: boolean = false;
    userSubTitle: string = '';
    showSpinner: boolean = false;
    constructor(private service: DayEndService, private cacheService: CacheService, private userService: UserService,
        protected notification: NotificationsService, private dayEndPipe: DayEndPipe, private genericSort: GenericSort,private modalService: NgbModal) { }

    ngOnInit() {
        const now = new Date();
        this.todaysDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
        this.logedInUser = this.userService.getUser();
	this.service.getBranches(this.logedInUser.UserId).subscribe((res) => {
			 this.branches = JSON.parse(JSON.stringify(res));
		 
		});
		this.getDrivers();
		this.filter = this.service.getFilter();
	this.filter = JSON.parse(JSON.stringify(this.filter));
		if (!this.filter.userBranch && this.branches.length != 2) {
                this.filter.userBranch = 0;
        }else if (!this.filter.userBranch && this.branches.length === 2) {
			this.filter.userBranch = 1;
		}
		if(this.cacheService.has("filterdata")){
			
			this.cacheService.get("filterdata").subscribe((response) => {
			this.filter = JSON.parse(JSON.stringify(response));
		}); 
		}
		
		if (this.logedInUser.IsDistributor && this.logedInUser.Distributor.DistributorMasterId && this.filter.userBranch <= 1) {
            this.filter.userBranch = this.logedInUser.Distributor.DistributorMasterId;
		}
		
		this.service.getDistributerAndCopacker().subscribe((res) => {
			 this.distributors = res;
			 
		});
		
        if (this.logedInUser.IsDistributor) {
            this.userSubTitle = ` - ${this.logedInUser.Distributor.DistributorName}`;
        }
		
		
        if (this.logedInUser.Role.RoleID === 3 && this.logedInUser.IsSeasonal) {
            this.logedInUser.IsRIInternal = true;
            this.logedInUser.IsDistributor = false;
        }
		if (this.cacheService.has("dayendRefreshtime")){
			this.cacheService.get("dayendRefreshtime").subscribe((response) => {
				this.refreshTimestamp = response;
			});
		}
		if (this.cacheService.has("noDataMessage")&& !(this.cacheService.has("backstatus"))) {
			
			
			this.cacheService.get("noDataMessage").subscribe((response) => {
					this.refreshMessage = "";
					this.noDataMessage = response; 
				
						
				 }); 
		}else if(this.cacheService.has("backstatus")){
			this.cacheService.deleteCache("backstatus");
			this.getRefreshTrip();
		}
		if (this.cacheService.has("tripslist")&& !(this.cacheService.has("backstatus"))) {
			
			
			this.cacheService.get("tripslist").subscribe((response) => {
				
				if(response.length){
					this.trips = response;
					this.refreshMessage = "";
				}
						
				 }); 
				

		}else if(this.cacheService.has("backstatus")){
			this.cacheService.deleteCache("backstatus");
			this.getRefreshTrip();
		}
		
		this.validateData();
		

    }
	
	getDrivers() {
        this.service.getAllDriver().subscribe(res => {
           this.allDrivers = JSON.parse(JSON.stringify(res));
		   this.getUniqDriver();
        });
    }
	getUniqDriver(){
		this.drivers = [];
		let tempdriver:any = [];
		let drivers = JSON.parse(JSON.stringify(this.allDrivers));
		  (drivers).shift();
		drivers.filter((dri) => {
			if(this.filter.type === 'internal' && dri.data.DistributorCopackerID === null ){
				
				tempdriver[dri.data.UserId] = dri;
			}
			if(this.filter.type === 'distributor' && dri.data.DistributorCopackerID != null ){
				
				tempdriver[dri.data.UserId] = dri;
			}
			
		});
		
		 this.drivers = tempdriver;
		 if(this.filter.type === 'distributor'){
			 	(this.drivers).unshift({"value":1,"label":"All Drivers"});
		 }
		
		 (this.drivers).unshift({"value":0,"label":"Select Driver"});
		 
	}

refreshDataHandler(byType: any = '')
{
	if(byType === "yes"){
		
			this.filter.userBranch = 0;
	}
	this.validateData();
	if(this.trips){
		this.trips = [];
	    this.noDataMessage = "";
		this.refreshMessage = "Please click View Trips button to get latest data";
	}
	this.cacheService.set("tripslist", this.trips);
	this.cacheService.set("filterdata", this.filter);
	
}
	validateData(){
		
		if(this.filter.userBranch && ( this.filter.type === "internal" || this.filter.type === "distributor" ) )
		{
			this.buttonAction = true;
			return true;
			
		}else{
			this.buttonAction = false;
		return false;
		}
		
	}
	
	getRefreshTrip(){
		
			this.totalCreditAmount = 0;
			this.showSpinner = true;
			this.trips = [];
			let selDate = this.service.formatDate(this.filter.selectedDate);
			let selBranch = this.filter.userBranch;
			let seluserType = this.filter.type;
			let tripState = this.filter.tripState;
			let isRI = ( seluserType === "internal" )?true:false;
			this.cacheService.deleteCache("noDataMessage");
			this.cacheService.deleteCache("tripslist");
			this.service.getTrips(selDate,selBranch,isRI,tripState).subscribe((res) => {
			  
			   this.trips = res.DayEnd || [];
			  
				if(!this.trips.length){
					
					this.noDataMessage = "No Data Found";
					 this.cacheService.set("noDataMessage", this.noDataMessage);
				}else{
				
					this.cacheService.set("tripslist", this.trips);
					this.refreshMessage = "";
				}
				 
				 this.cacheService.set("filterdata", this.filter);
				
				this.getTimeStamp();
				this.showSpinner = false;
			},
            (error) => {
                this.showSpinner = false;
                if (error) {

                    this.notification.error('', 'Something went wrong while fetching data');
                }
            }, );
		
	
	}
	getTimeStamp(){
		let now = new Date();
		var dd = (now.getDate() < 10 ? '0' : '') + now.getDate();
		var MM = ((now.getMonth() + 1) < 10 ? '0' : '') + (now.getMonth() + 1);
		
		var hours = now.getHours() > 12 ? now.getHours() - 12 : now.getHours();
        var am_pm = now.getHours() >= 12 ? "PM" : "AM";
		var hh = hours < 10 ? "0" + hours : hours;
		var mm = ( now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
		this.refreshTimestamp = MM + '/' + dd +" " +hh + ":" + mm +  " " + am_pm;
		this.cacheService.set("dayendRefreshtime", this.refreshTimestamp);
		return true;
		
	}
   
    /**
     * This functiuon is used for print the list of day-end trip
     */
    popupWin:any;
    printPage() {
        let printContents, printContentsHead;
        //printContentsHead = document.getElementById('day-end-list-head').innerHTML;
        if(this.popupWin){this.popupWin.close();}
        setTimeout(()=>{
        this.popupWin = window.open('', '_new', 'top=0,left=0,height="100",width="100%",fullscreen="yes"');
        this.popupWin.document.open();
        this.popupWin.document.write(`
          <html>
            <head>
              <title>Day End Trip List</title>
              <style>
              //........Customized style.......
              </style>
            </head>
            <body onload="window.print();window.close()">${this.populatePrintData()}</body>
          </html>`
        );
        this.popupWin.document.close();
    },1000);
    }
    /**
     * This functiuon is used for prepare the list of trips as a print format
     */
    populatePrintData() {
        let tbody = '', thead = '', table = '', selectedData = '', branch: any = {};
        let filterDataForPrint: any = [];
        filterDataForPrint = this.dayEndPipe.transform(this.trips, this.filter.type, this.filter.userBranch);
        filterDataForPrint=this.genericSort.transform(filterDataForPrint,this.customer.sortField,this.customer.isAsc);
        if (this.filter.type === 'internal') {
            branch = this.branches.filter(item => item.value === this.filter.userBranch)[0];
        } else if (this.filter.type === 'distributor') {
            branch = this.distributors.filter(item => item.value === this.filter.userBranch)[0];
        }
        selectedData += `<table width="100%">
        <thead>
        <tr>
            <th align="left">Delivery Date</th>
            <th align="left">Driver Type</th>
            ${this.filter.type === 'internal' ? '<th align="left">Business Unit</th>' : ''}
            ${this.filter.type === 'distributor' ? '<th align="left">Distributor</th>' : ''}
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>${this.filter.selectedDate.day}-${this.filter.selectedDate.month}-${this.filter.selectedDate.year}</td>
            <td>${this.filter.type == 'internal' ? 'RI Internal' : this.filter.type == 'distributor' ? 'Distributor' : ''}</td>
            <td>${branch ? branch.label : ''}</td>
        </tr>
        </tbody>
        </table>`
        thead += `
        <thead class="tableHeader">
            <tr>
                ${this.logedInUser.IsRIInternal ? '<th>Route #</th>' : ''}
                ${this.logedInUser.IsRIInternal ? '<th>Business Unit</th>' : ''}
                <th>Driver</th>
                <th>Trip Code</th>
                <th>Total Sale</th>
                <th>Received Amt</th>
                <th>HH Day End</th>
                <th># of Tickets</th>
                <th>Status</th>                          
            </tr>
        </thead>`
        tbody += `<tbody >`;
        if (filterDataForPrint && filterDataForPrint.length <= 0) {
            tbody += `<tr><td colspan="11" align="center">No data found</td></tr>`
        } else {
            filterDataForPrint.forEach(item => {
                tbody += `<tr> ${(this.logedInUser.IsRIInternal) ? `<td>${!item.IsUnplanned ? item.RouteNumber : 'Unplanned'}</td>` : ''}
                ${(this.logedInUser.IsRIInternal) ? `<td>${item.BranchCode}-${item.BranchName}</td>` : ''}
                <td>${item.DriverName}</td>
                <td>${item.TripCode}</td>
                <td>$${item.TripTotalSale}</td>
                <td>$${item.TripTotalAmount}</td>
                <td><input type="checkbox" name="tripHHMultiSelect" disabled ${item.IsClosed && 'checked'}></td>
                <td>${item.NoOfTickets}</td>
                <td>
                    <i class="custom-tooltip-ion">
                    ${item.TripStatusID == 23 ? '<span class="tooltiptext">Draft</span>' : ''}
                    ${item.TripStatusID == 24 ? '<span class="tooltiptext">Submitted</span>' : ''}
                    ${item.TripStatusID == 25 ? '<span class="tooltiptext">Approved</span>' : ''}
                    </i>            
                </td>
                </tr>`
            });
        }
        tbody += `</tbody>`;
        table = `${selectedData}<br/><table cellpadding="5" border=1 style="border-collapse: collapse;">${thead}${tbody}</table>`;
        return table;
    }
    sortable(name){
        this.customer.sortField = name;
        this.customer.isAsc=!this.customer.isAsc;
    }
	
}

