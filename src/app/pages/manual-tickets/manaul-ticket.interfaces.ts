export interface TicketDetail {
    TicketDetailID: number;
    TicketID: number;
    ProductID: number;
    Quantity: number;
    Rate: number;
    IsTaxable: boolean;
    TaxPercentage: number;
    StartMeterReading: number;
    EndMeterReading: number;
    AssetId: number;
    DeliveredBags: number;
}

export interface ManualTicket {
    TicketID: number;
    Customer: any;
    CustomerID: number;
    HHCustomerID: number;
    TripID: number;
    TicketTypeID: number;
    SaleTypeID: number;
    DNSImageID: number;
    DNSReasonID: number;
    PODImageID: number;
    ReceiverSignatureImageID: number;
    CreditCardTransactionID: number;
    TicketNumber: string;
    IsInvoice: boolean;
    DeliveryDate: any;
    PONumber: string;
    CashAmount: string;
    CheckAmount: string;
    CheckNumber: string;
    CreditCardAmount: string;
    ReceiverName: string;
    IsDexed: boolean;
    PrintedCopies: string;
    Notes: string;
    TaxAmount: string;
    IsPaperTicket: boolean;
    IsNoPayment: boolean;
    CardPaymentStatus: string;
    Created: string;
    CreatedBy: string;
    Modified: string;
    ModifiedBy: string;
    TicketStatusID: number;
    OrderID: number;
    BranchID: number;
    CashRecvPrevDelv: string;
    IsClosed: boolean;
    IsPrinted: boolean;
    ClosedReason: string;
    RevisitNote: string;
    RevisitDate: number;
    IsRevisitClosed: boolean;
    IsReqRevisit: boolean;
    ReasonPictureID: number;
    SignImageID: number;
    TktType: string;
    IsReceivingPayment: boolean;
    CurrentBalance: string;
    CurrentBalanceDateTime: number;
    CurrentBalanceDelDate: number;
    RecordTypeId: number;
    TotalAmount: number;
    TotalSale: number;
    IsSaleTicket: boolean;
    TicketDetail: TicketDetail[];
    Mode: number;
    UserId: number;
}
