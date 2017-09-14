import { NotificationsService } from 'angular2-notifications';
import { UserService } from '../../../../shared/user.service';
import { selector } from 'rxjs/operator/multicast';
import { LocalDataSource } from 'ng2-smart-table';
import { UserManagementService } from '../../user-management.service';
import { AfterContentInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../user-management.interface';
import { any } from 'codelyzer/util/function';

@Component({
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss'],
    selector: 'create-user',
})
export class CreateUserComponent implements OnInit, AfterContentInit {

    private _roles: any[];
    private _user: any = {};

    @Input()
    get user(): any {
        return this._user;
    }

    set user(val: any) {
        if (!Object.keys(val).length) {
            return;
        }
        val.RoleID = val.RoleID || this._user.RoleID;
        this._user = val;
        this.loadBranches();
        this._user.IsSeasonal = this.isDistributorSeasonal();
        if (val.RoleID === '1' || val.RoleID === '2') {
            this.user.BranchID = '1';
        }
    }

    @Input() isNewUser: boolean;
    @Input() formIsDirty: boolean;
    @Input()
    get roles(): any {
        return this._roles;
    }
    set roles(values) {
        if (!values) { return; }
        this._roles = values;
        this.filterRoles();
    }
    @Input()
    get action(): any {
        return this;
    }
    set action(values) {
        if (values === '') { return; }
        this.actionName = values;
        if (values == 'create') {
            this.user.IsActive = true;
        }
        if (values == 'edit') {
            this.isFormValid = false;
        }
    }

    @Input()
    set mIOpen(val: boolean) {
        if (!val) { this.clearInternalUserSearch(); }
    }

    @Input() branches: any;
    @Input() userDetails: any;
    @Input() distributorsAndCopackers: any;
    @Input() isDistributorAdmin: boolean;
    @Output() onSaveUser: EventEmitter<any> = new EventEmitter();
    @Output() onUpdateUser: EventEmitter<any> = new EventEmitter();
    @Output() closeNewUser: EventEmitter<any> = new EventEmitter();

    @Output() formChanged = new EventEmitter();

    actionName: string;
    riUserList: any = [];
    riUserName: string = '';
    searchedUsers: any;
    showList: boolean = false;
    selectedSearchUser: boolean = false;
    timeOut: any;
    roleList: any = [];
    userObject: any = {};
    roleNameAllowed: boolean = true;
    isEmailExist: boolean = false;
    isFormValid: boolean = true;

    searching: boolean = false;


    constructor(private umService: UserManagementService, private userService: UserService, private notification: NotificationsService) { }


    clearInternalUserSearch() {
        this.riUserName = '';
        this.searching = false;
        this.showList = false;
        this.riUserList = [];
    }

    toInt(num: string) {
        return +num;
    }

    sortByWordLength = (a: any) => {
        return a.city.length;
    }
    searchUserHandler(user) {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
            this.timeOut = null;
        }
        this.searching = user.length;
        this.showList = false;
        this.searchedUsers = {};
        this.riUserList = [];
        if (!user) { return; }
        this.timeOut = setTimeout(() => {
            this.umService.searchInternalUsers(user).subscribe((res) => {
                this.searchedUsers = res;
                this.riUserList = Object.keys(res);
                this.showList = true;
                this.searching = false;
                this.isAllFeildsChecked();

            }, (err) => {
                this.searching = false;
                this.showList = true;
                this.riUserList.push('No data found');

            });
        }, 1000);
    }

    userSelected(_user) {
        this.riUserName = '';
        this.showList = false;
        const user = this.searchedUsers[_user];
        if (!user) { return; }
        this.user.FirstName = user.displayname[0].split(' ')[0] || '';
        this.user.LastName = user.displayname ? user.displayname[0].split(' ')[1] : '';
        this.user.UserName = user.cn[0] || '';
        this.user.EmailID = user.mail ? user.mail[0] : '';
        this.riUserName = _user;
        this.selectedSearchUser = true;
        this.isFormValid = true;
    }

    onSubmit() {
        if (this.userObject.IsDistributor) {
            this.user.DistributorMasterID = this.userObject.Distributor.DistributorMasterId;
        }
        if (!this.validateUser(this.user)) { return };
        // If user is RI internal user then distributor ID should be set to empty
        if (this.userDetails.IsDistributor) {
            this.user.DistributorMasterID = this.userDetails.Distributor.DistributorMasterId;
        } else if (this.user.IsRIInternal) {
            this.user.DistributorMasterID = '';
        }
        if(!this.user.IsRIInternal && !this.user.IsSeasonal){
            this.user.BranchID = null;
        }
        this.isNewUser ? this.onSaveUser.emit(this.user) : this.onUpdateUser.emit(this.user);
    }

    validateUser(user) {
        if (!user.IsRIInternal) {
            if (!user.DistributorMasterID) {
                this.notification.error('Distributor is mandatory!!!');
                return false;
            } else if (user.IsSeasonal && !user.BranchID) {
                this.notification.error('Branch is mandatory!!!');
                return false;
            }
        } else {
            if (!user.BranchID) {
                this.notification.error('Branch is mandatory!!!');
                return false;
            }
        }
        return true;
    }

    ngAfterContentInit() {
        this.riUserName = '';
    }

    ngOnInit() {
        this.umService.getDistributerAndCopacker().subscribe((res) => {
            this.distributorsAndCopackers = res;
            console.log(res);
        });
        this.userObject = this.userService.getUser();
        if (this.isNewUser) {
            this.user.RoleID = this.roles ? this.roles[0].RoleID : '';
            if (!this.isDistributorAdmin) {
                this.user.DistributorMasterID = this.distributorsAndCopackers ? this.distributorsAndCopackers[0].DistributorCopackerID : '';
            }
            this.user.BranchID = this.branches ? this.branches[0].BranchID : '';
        }
    }

    filterRoles() {
        this.roleList = this.roles.reduce((accumulator, child) => {
            if (child.ShowExternal) {
                return [
                    ...accumulator,
                    child,
                ];
            }
            return accumulator;
        }, []);
        if (this.roleList && this.roleList.length === 1) {
            this.user.RoleID = this.roleList[0].RoleID;
        }
    }

    isDistributorSeasonal() {
        if (!this.user.DistributorMasterID) { return false };
        const tmp = this.distributorsAndCopackers.filter((dis) => {
            return dis.DistributorCopackerID === +this.user.DistributorMasterID
        });
        return tmp[0].IsSeasonal;
    }

    changeHandler() {
        this.user.IsSeasonal = this.isDistributorSeasonal();
        this.isAllFeildsChecked();
        if (this.user.IsRIInternal) {
            this.roleList = this.roles;
        } else if (!this.user.IsRIInternal) {
            this.riUserName = '';
            this.roleList = this.roles.reduce((accumulator, child) => {
                if (child.ShowExternal) {
                    return [
                        ...accumulator,
                        child,
                    ];
                }
                return accumulator;
            }, []);
            if (this.selectedSearchUser) {
                this.user = <User>{
                    FirstName: '',
                    LastName: '',
                    UserName: '',
                    EmailID: '',
                    BranchID: '',
                    Phone: '',
                    role: '',
                    IsActive: true,
                    IsSeasonal: true,
                    IsRIInternal: false,
                };
                this.selectedSearchUser = false;
            }

        }
        this.formChanged.emit('changed');
    }

    resetUser() {
        this.user = {};
    }
    checkEmail(email) {
        this.userService.isUserExist(email).subscribe((res) => {
            // console.log(res);
            if (res.Message === 'Email already exists') {
                this.isEmailExist = true;
            } else {
                this.isEmailExist = false;
            }

        }, (err) => {

        });
    }
    roleChange(roleID) {
        this.user.BranchID = null;
        if (roleID === '1' || roleID === '2' || roleID === '4' || roleID === '5') {
            if (this.branches[0].BranchID != '1') {
                this.branches.unshift({ BranchID: '1', BranchName: 'All Branches' });
            }
            this.user.BranchID = '1';
            this.loadBranches();
        } else {
            if (this.branches[0].BranchID == '1') {
                this.branches.shift();
            }
            // this.distributorsAndCopackers = [];
        }

    }

    loadBranches() {
        if (!this.user.BranchID) { return; }

        this.umService.getDistributerAndCopacker().subscribe((res) => {
            this.distributorsAndCopackers = res;
            console.log(res);
        });
    }
    spaceRemover(value) {
        this.user.LastName = value.replace(/^\s+|\s+$/g, '');
    }
    spaceRemoverFn(value) {
        this.user.FirstName = value.replace(/^\s+|\s+$/g, '');
    }
    riChangeHandler(status) {
        console.log(status);
        if (status) {
            this.user.FirstName = '';
            this.user.LastName = '';
            this.user.EmailID = '';
        }
        else {
            this.umService.getDistributerAndCopacker().subscribe((res) => {
                this.distributorsAndCopackers = res;
            });
        }
        this.isAllFeildsChecked();

    }

    isAllFeildsChecked() {
        console.log(this.user.FirstName);
        if (this.user.FirstName == '' || this.user.LastName == '' || this.user.EmailID == ''
            || this.user.RoleID == undefined) {
            this.isFormValid = false;
        }
        else {
            this.isFormValid = true;
        }
    }
}
