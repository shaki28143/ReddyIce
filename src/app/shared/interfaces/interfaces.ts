export interface Branch {
    BranchCode: number;
    BranchID: number;
    BranchName: string;
}

export interface Customer {
    CustomerId: number;
    BranchID: number;
    BranchCode: number;
    LocationID: number;
    LocationCode: string;
    RouteID: number;
    RouteCode: string;
    CustomerNumber: number;
    CustomerName: string;
    CustType: number;
    Address1: string;
    Address2: string;
    City: string;
    State: string;
    Country: string;
    ZipCode: number;
    Phone: number;
    Extn: string;
    Email: string;
    Company: string;
    LocationKey: string;
    CustomerKey: string;
    ChainCode: string;
    ChainZone: string;
    PrimayContact: string;
    SecondaryContact: string;
    TicketMessage: string;
    IsTaxable: boolean;
    TaxPercentage: boolean;
    CustomerTypeCode: string;
    latitude: string;
    longitude: string;
    AllowReturnsameticket: string;
    FreightCodePriceFile: string;
    MobileIn: boolean;
    SoldBy: string;
    AreaCode: string;
    PORequired: boolean;
    PrevBalance: string;
    PrintUPC: boolean;
    CustomerGLType: string;
    StoreDept: string;
    DUNSNumber: number;
    DistributorType: string;
    DistributorMasterID: string;
    MappedProducts?:mProducts[];
    productdetail:ProductDetail[];
    Tax: number;
    CustomerTypeID: number;
    PaymentType: number;
}
export interface mProducts {
    ExternalCustomerProductID:number;
    ExternalCustomerID:number;
    ProductID:number;
    Price:number;
    BranchID:number;
    Active:boolean;
    Created:any;
    CreatedBy:number;
    Modified:any;
    ModifiedBy:any;
    ExternalProductID:number;
}

export interface ProductDetail {
    Active: number;
    CustomerProductID: number;
    DisplayName: string;
    Drayage: number;
    Price: number;
    ProductCode: number;
    ProductID: number;
    ProductName: string;
    SKU: number;
    UPC: string;
}

export interface Select {
    id: number;
    label: string;
    data?: any;
}

export interface DualListItem {
    label: string;
    id: number;
    data: any;
    selected?: boolean;
}