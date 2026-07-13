export interface incomeType {
    id: string
     amount: number,
    incomeCategoryId: string,
    paymentMethod: string,
    incomeSource: string,
    clientName: string,
    referenceNumber: string,
    invoiceNumber: string,
    description: string,
    transactionDate: Date
}