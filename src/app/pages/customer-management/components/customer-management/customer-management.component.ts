import { NotificationsService } from 'angular2-notifications';
import { CustomerManagementService } from '../../customer-management.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../../shared/user.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
@Component({
    templateUrl: './customer-management.component.html',
    styleUrls: ['./customer-management.component.scss'],
})
export class CustomerManagementComponent implements OnInit {

    customers: any[] = [];
    // selectedCustomer: any = [];
    isDistributorExist: boolean;
    userSubTitle: string = '';
    showSpinner: boolean = false;
    constructor(
        protected service: CustomerManagementService,
        private route: ActivatedRoute,
        private userService: UserService,
        private notification: NotificationsService,
        private modalService: NgbModal,
    ) { }

    ngOnInit() {
        const userId = localStorage.getItem('userId') || '';
        this.userService.getUserDetails(userId).subscribe((response) => {
            this.isDistributorExist = response.IsDistributor;
            this.userSubTitle = (this.isDistributorExist) ? '-' + ' ' + response.Distributor.DistributorName : '';
        });
        this.getAllCustomers();
    }

    isRI = true;
    sequenceChangeHandler(sequence) {
        if (sequence == 1) {
            this.isRI = true;
        } else {
            this.isRI = false;
        }
    }

    getAllCustomers() {
        this.showSpinner = true;
        this.service.getAllCustomers().subscribe((res) => {
            this.customers = res;
            this.showSpinner = false;
            // console.log(this.customers);
        }, (err) => {
            // console.log(err);
        });
    }

    deleteCustomer(customerId) {
        const activeModal = this.modalService.open(ModalComponent, {
            size: 'sm',
            backdrop: 'static',
        });
        activeModal.componentInstance.BUTTONS.OK = 'OK';
        activeModal.componentInstance.showCancel = true;
        activeModal.componentInstance.modalHeader = 'Warning!';
        activeModal.componentInstance.modalContent = `Are you sure you want to delete the customer?`;
        activeModal.componentInstance.closeModalHandler = (() => {
            const data = [{ 'CustomerType': 2, 'CustomerId': customerId }];
            this.service.deleteCustomer(data).subscribe((res) => {
                this.notification.success('Deleted Succesfully!!');
                this.getAllCustomers();
            }, (err) => {
                this.notification.error('Error in Deleting a customer!!');
            });
           
        });
    }
}
