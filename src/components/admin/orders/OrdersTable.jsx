import { useState, useRef, useEffect } from "react";
import {
    Calendar, Clock, CreditCard, Eye, Gift, Package,
    RefreshCw, Tag, User, XCircle, Ban, Undo2,
    Truck, CheckCircle, RotateCcw, AlertCircle, Info,
    ChevronDown, Check
} from "lucide-react";
import { FulfillmentStatusSelect } from "./FulfillmentStatus";
import { createPortal } from "react-dom";
import { TableTooltip } from "./TableTooltip";



const getPaymentStatusBadge = (status) => {
    const styles = {
        paid: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        refunded: "bg-purple-100 text-purple-700",
        failed: "bg-red-100 text-red-700"
    };
    return styles[status] || "bg-gray-100 text-gray-700";
};

const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const canCancel = (status) => {
    return ["pending", "assigned"].includes(status);
};

const canRefund = (order) => {
    return order.paymentStatus === "paid" &&
        order.refundStatus === "none" &&
        !["cancelled", "returned"].includes(order.fulfillmentStatus);
};

const canReturn = (order) => {
    return ["shipped", "delivered"].includes(order.fulfillmentStatus) &&
        order.returnStatus === "none";
};

export default function OrdersTable({
    orders,
    onAssignTag,
    onViewDetails,
    onUpdateStatus,
    onCancelOrder,
    onProcessRefund,
    onProcessReturn,
    onCompleteReturn,
    updatingStatus,
    statusUpdateOrder,
    processingAction
}) {
    if (orders.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No orders found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto relative">
            <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Order ID</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Customer</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Product</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Purchase Type</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Payment</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Tag</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">
                            <div className="flex items-center gap-1">
                                Fulfillment
                                <TableTooltip content="Status flow: Pending → Assigned → Shipped → Delivered">
                                    <Info size={12} className="text-gray-600 hover:text-gray-600 transition-colors cursor-pointer" />
                                </TableTooltip>
                            </div>
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Created</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => {
                        const currentStatus = order.fulfillmentStatus;
                        const isUpdating = updatingStatus && statusUpdateOrder === order._id;
                        const hasTag = !!order.assignedTag;

                        return (
                            <tr key={order._id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <span className="font-mono text-sm font-medium text-gray-900">
                                        #{order._id?.slice(-8).toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{order.user?.name || "Guest"}</p>
                                        <p className="text-xs text-gray-500 break-all max-w-[200px]">{order.user?.email}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {order.product?.image?.url && (
                                            <img src={order.product.image.url} alt="" className="w-8 h-8 rounded object-cover hidden sm:block" />
                                        )}
                                        <span className="text-sm text-gray-600 max-w-[200px] truncate">{order.product?.name}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${order.purchaseType === "gift"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}>
                                        {order.purchaseType === "gift" ? <Gift size={10} /> : <User size={10} />}
                                        <span className="hidden sm:inline">{order.purchaseType === "gift" ? "Gift" : "Self"}</span>
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full w-fit ${getPaymentStatusBadge(order.paymentStatus)}`}>
                                            {order.paymentStatus === "paid" ? <CreditCard size={10} /> :
                                                order.paymentStatus === "refunded" ? <RotateCcw size={10} /> :
                                                    <Clock size={10} />}
                                            {order.paymentStatus === "paid" ? "Paid" :
                                                order.paymentStatus === "refunded" ? "Refunded" :
                                                    "Pending"}
                                        </span>
                                        {order.refundStatus === "requested" && (
                                            <span className="text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded-full w-fit">
                                                Refund Req
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {order.assignedTag ? (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-mono">
                                            {order.assignedTag.tagCode}
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => onAssignTag(order)}
                                            className="text-xs text-blue-600 hover:underline cursor-pointer"
                                            disabled={processingAction}
                                        >
                                            Assign Tag
                                        </button>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="relative">
                                        <FulfillmentStatusSelect
                                            currentStatus={currentStatus}
                                            orderId={order._id}
                                            onUpdateStatus={onUpdateStatus}
                                            isUpdating={isUpdating}
                                            hasTag={hasTag}
                                        />
                                        
                                        {order.returnStatus === "requested" && (
                                            <div className="mt-1">
                                                <span className="text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded-full">
                                                    Return Req
                                                </span>
                                            </div>
                                        )}
                                        {order.returnStatus === "shipped" && (
                                            <div className="mt-1">
                                                <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full">
                                                    Return Shipped
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar size={12} className="hidden sm:block" />
                                        {formatDate(order.createdAt)}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {!order.assignedTag && order.fulfillmentStatus !== "cancelled" && order.fulfillmentStatus !== "returned" && (
                                            <button
                                                onClick={() => onAssignTag(order)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                                title="Assign Tag"
                                                disabled={processingAction}
                                            >
                                                <Tag size={16} className="text-gray-500 group-hover:text-blue-600" />
                                            </button>
                                        )}

                                        {canCancel(order.fulfillmentStatus) && (
                                            <button
                                                onClick={() => onCancelOrder(order)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                                title="Cancel Order"
                                                disabled={processingAction}
                                            >
                                                <Ban size={16} className="text-gray-500 group-hover:text-red-600" />
                                            </button>
                                        )}

                                        {canRefund(order) && (
                                            <button
                                                onClick={() => onProcessRefund(order)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                                title="Process Refund"
                                                disabled={processingAction}
                                            >
                                                <RotateCcw size={16} className="text-gray-500 group-hover:text-purple-600" />
                                            </button>
                                        )}

                                        {canReturn(order) && (
                                            <button
                                                onClick={() => onProcessReturn(order)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                                title="Process Return"
                                                disabled={processingAction}
                                            >
                                                <Undo2 size={16} className="text-gray-500 group-hover:text-orange-600" />
                                            </button>
                                        )}

                                        {order.returnStatus === "shipped" && (
                                            <button
                                                onClick={() => onCompleteReturn(order._id)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                                title="Complete Return"
                                                disabled={processingAction}
                                            >
                                                <CheckCircle size={16} className="text-gray-500 group-hover:text-green-600" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onViewDetails(order)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                            title="View Details"
                                        >
                                            <Eye size={16} className="text-gray-500 group-hover:text-blue-600" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}