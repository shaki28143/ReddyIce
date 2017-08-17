import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Pages } from '../../../pages/pages.component';
@Component({
    selector: 'pagination',
    template: `
        <nav aria-label="Page navigation example">
          <ul class="pagination justify-content-end">
            <li class="page-item" [ngClass]="{'disabled':currentPageIndex==1}">
              <a class="page-link" (click)="pageChangeHandler(currentPageIndex-1)">Previous</a>
            </li>
            <li *ngFor="let a of options.pages; let i = index" class="page-item"
             [ngClass]="{'btn-danger': i+1 == currentPageIndex}">
                <a class="page-link" (click)="pageChangeHandler(i+1, 2)">{{i+1}}</a>
            </li>
            <li class="page-item" [ngClass]="{'disabled':currentPageIndex==options.pages.length}">
              <a class="page-link" (click)="pageChangeHandler(currentPageIndex+1)">Next</a>
            </li>
          </ul>
        </nav>
    `,
})
export class PaginationComponent {

    currentPageIndex: number = 1;
    _tableData = [];

    @Input()
    set tableData(data) {
        if (!data) { return; }
        this._tableData = data;
        this.setPagination();
        this.pageChangeHandler(this.currentPageIndex);
    }

    get tableData(): any[] {
        return this._tableData;
    }

    @Input()
    options: any = {
        itemPerPage: 10,
        pages: [],
    };

    @Input()
    currentPage: any;

    @Output()
    currentPageChange = new EventEmitter();

    pageChangeHandler(page) {
        setTimeout(() => {
            this.currentPageIndex = page;
            this.currentPage = this._tableData.slice((page - 1) * this.options.itemPerPage, page * this.options.itemPerPage);
            this.currentPageChange.emit(this.currentPage);
        });
    }
    
    setPagination() {
        this.options.pages = new Array(Math.ceil(this.tableData.length / this.options.itemPerPage));
    }

}