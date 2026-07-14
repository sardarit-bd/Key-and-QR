export const PAYMENT_STATUS = {
    // ************* Pending *************
    PENDING: "pending",
    PENDING_LABEL: "Pending",

    // ************* Processing *************
    PROCESSING: "processing",
    PROCESSING_LABEL: "Processing",

    // ************* Completed *************
    SUCCEEDED: "paid",
    SUCCEEDED_LABEL: "Paid",

    // ************* Failed *************
    FAILED: "failed",
    FAILED_LABEL: "Failed",

    // ************* Cancelled *************
    CANCELLED: "cancelled",
    CANCELLED_LABEL: "Cancelled",

    // ************* Refunded *************
    REFUNDED: "refunded",
    REFUNDED_LABEL: "Refunded",

    // ************* Partial Refund *************
    PARTIAL_REFUNDED: "partial_refunded",
    PARTIAL_REFUNDED_LABEL: "Partially Refunded",

    // ************* Abandoned *************
    ABANDONED: "abandoned",
    ABANDONED_LABEL: "Abandoned",
};

// ************* Payment Status Groups *************
export const PAYMENT_STATUS_GROUPS = {
    ACTIVE: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PROCESSING],
    COMPLETED: [PAYMENT_STATUS.SUCCEEDED],
    FAILED: [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.ABANDONED],
    REFUNDED: [PAYMENT_STATUS.REFUNDED, PAYMENT_STATUS.PARTIAL_REFUNDED],
};

// ************* Check if payment is successful *************
export const isPaymentSuccessful = (status) => {
    return status === PAYMENT_STATUS.SUCCEEDED;
};

// ************* Check if payment is pending *************
export const isPaymentPending = (status) => {
    return [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PROCESSING].includes(status);
};

// ************* Check if payment is failed *************
export const isPaymentFailed = (status) => {
    return [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.ABANDONED].includes(status);
};

// ************* Check if payment is refunded *************
export const isPaymentRefunded = (status) => {
    return [PAYMENT_STATUS.REFUNDED, PAYMENT_STATUS.PARTIAL_REFUNDED].includes(status);
};

// ************* Get payment status label *************
export const getPaymentStatusLabel = (status) => {
    const statusMap = {
        [PAYMENT_STATUS.PENDING]: PAYMENT_STATUS.PENDING_LABEL,
        [PAYMENT_STATUS.PROCESSING]: PAYMENT_STATUS.PROCESSING_LABEL,
        [PAYMENT_STATUS.SUCCEEDED]: PAYMENT_STATUS.SUCCEEDED_LABEL,
        [PAYMENT_STATUS.FAILED]: PAYMENT_STATUS.FAILED_LABEL,
        [PAYMENT_STATUS.CANCELLED]: PAYMENT_STATUS.CANCELLED_LABEL,
        [PAYMENT_STATUS.REFUNDED]: PAYMENT_STATUS.REFUNDED_LABEL,
        [PAYMENT_STATUS.PARTIAL_REFUNDED]: PAYMENT_STATUS.PARTIAL_REFUNDED_LABEL,
        [PAYMENT_STATUS.ABANDONED]: PAYMENT_STATUS.ABANDONED_LABEL,
    };
    return statusMap[status] || status;
};

export default PAYMENT_STATUS;