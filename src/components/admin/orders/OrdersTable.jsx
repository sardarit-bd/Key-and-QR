import { useState, useRef, useEffect } from "react";
import {
    Calendar, Clock, CreditCard, Eye, Gift, Package,
    RefreshCw, Tag, User, XCircle, Ban, Undo2,
    Truck, CheckCircle, RotateCcw, AlertCircle, Info,
    ChevronDown, Check, X
} from "lucide-react";
import { FulfillmentStatusSelect } from "./FulfillmentStatus";
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
    return order.refundStatus === "requested" &&
        order.paymentStatus === "paid" &&
        !["cancelled", "returned"].includes(order.fulfillmentStatus);
};

const canReturn = (order) => {
    return order.returnStatus === "requested";
};

const canCompleteReturn = (order) => {
    return ["approved", "shipped", "received"].includes(order.returnStatus);
};

// Helper function to get accurate assigned count
const getAccurateAssignedCount = (order) => {
    let count = 0;

    if (order.assignedTags && Array.isArray(order.assignedTags)) {
        count += order.assignedTags.length;
    }

    if (order.assignedTag && !order.assignedTags?.some(t => {
        const tagId = t.tag?._id || t.tag;
        return tagId?.toString() === order.assignedTag?._id?.toString();
    })) {
        count += 1;
    }

    return count;
};

const getAllTagsFromOrder = (order) => {
    const tags = [];
    const seenIds = new Set();

    if (order.assignedTags && Array.isArray(order.assignedTags)) {
        order.assignedTags.forEach(item => {
            let tagObj = null;

            if (item.tag && typeof item.tag === 'object') {
                tagObj = item.tag;
            } else if (item.tagId) {
                tagObj = { _id: item.tagId, tagCode: item.tagCode };
            } else if (item._id) {
                tagObj = item;
            }

            if (tagObj && tagObj.tagCode) {
                const tagId = tagObj._id?.toString() || tagObj.id?.toString();
                if (tagId && !seenIds.has(tagId)) {
                    seenIds.add(tagId);
                    tags.push({
                        code: tagObj.tagCode,
                        id: tagId
                    });
                }
            }
        });
    }

    if (order.assignedTag && order.assignedTag.tagCode) {
        const tagId = order.assignedTag._id?.toString();
        if (tagId && !seenIds.has(tagId)) {
            tags.push({
                code: order.assignedTag.tagCode,
                id: tagId
            });
        }
    }

    return tags;
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
    onRemoveTag,
    onReplaceTag,
    canEditTags,
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
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Tags</th>
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

                        const assignedCount = getAccurateAssignedCount(order);
                        const requiredCount = order.quantity || 1;
                        const hasAllRequiredTags = assignedCount >= requiredCount;
                        const hasAnyTag = assignedCount > 0;
                        const tagsEditable = canEditTags(order.fulfillmentStatus);
                        const allTags = getAllTagsFromOrder(order);

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
                                                Refund Requested
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {hasAnyTag ? (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1">
                                                {allTags.slice(0, 3).map((tag, idx) => {
                                                    // Ensure tag.id is a clean string
                                                    const cleanTagId = tag.id?.toString();
                                                    console.log(`Tag ${idx}:`, { originalId: tag.id, cleanId: cleanTagId, code: tag.code });

                                                    return (
                                                        <div key={idx} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs">
                                                            <span>{tag.code}</span>
                                                            {tagsEditable && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            const tagIdString = typeof tag.id === 'object' ? tag.id._id || tag.id.toString() : tag.id;
                                                                            onReplaceTag(order._id, tagIdString, tag.code);
                                                                        }}
                                                                        className="hover:text-green-600 transition ml-0.5 cursor-pointer"
                                                                        title="Replace tag"
                                                                        disabled={processingAction}
                                                                    >
                                                                        <RefreshCw size={10} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const tagIdString = typeof tag.id === 'object' ? tag.id._id || tag.id.toString() : tag.id;
                                                                            console.log("Remove tag - Tag ID:", tagIdString, "Tag Code:", tag.code);
                                                                            onRemoveTag(order._id, tagIdString, tag.code);
                                                                        }}
                                                                        className="hover:text-red-600 transition cursor-pointer"
                                                                        title="Remove tag"
                                                                        disabled={processingAction}
                                                                    >
                                                                        <X size={10} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {allTags.length > 3 && (
                                                    <span className="text-xs text-gray-500">+{allTags.length - 3}</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {assignedCount} / {requiredCount} tags
                                                {!hasAllRequiredTags && tagsEditable && (
                                                    <span className="text-orange-500 ml-1">(Incomplete)</span>
                                                )}
                                            </div>
                                            {!hasAllRequiredTags && tagsEditable && (
                                                <button
                                                    onClick={() => onAssignTag(order)}
                                                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                                                    disabled={processingAction}
                                                >
                                                    {hasAnyTag ? "Add Tag" : "Assign Tag"}
                                                </button>
                                            )}
                                            {!tagsEditable && hasAnyTag && (
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Tags locked ({order.fulfillmentStatus})
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        tagsEditable ? (
                                            <button
                                                onClick={() => onAssignTag(order)}
                                                className="text-xs text-blue-600 hover:underline cursor-pointer"
                                                disabled={processingAction}
                                            >
                                                Assign Tag
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">No tags assigned</span>
                                        )
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="relative">
                                        <FulfillmentStatusSelect
                                            currentStatus={currentStatus}
                                            orderId={order._id}
                                            onUpdateStatus={onUpdateStatus}
                                            isUpdating={isUpdating}
                                            hasAllRequiredTags={hasAllRequiredTags}
                                        />

                                        {order.returnStatus === "requested" && (
                                            <div className="mt-1">
                                                <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded-full">
                                                    <Clock size={10} />
                                                    Return Requested
                                                </span>
                                            </div>
                                        )}
                                        {order.returnStatus === "approved" && (
                                            <div className="mt-1">
                                                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full">
                                                    <CheckCircle size={10} />
                                                    Return Approved
                                                </span>
                                            </div>
                                        )}
                                        {order.returnStatus === "shipped" && (
                                            <div className="mt-1">
                                                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full">
                                                    <Truck size={10} />
                                                    Return Shipped
                                                </span>
                                            </div>
                                        )}
                                        {order.returnStatus === "completed" && (
                                            <div className="mt-1">
                                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded-full">
                                                    <CheckCircle size={10} />
                                                    Return Completed
                                                </span>
                                            </div>
                                        )}
                                        {order.returnStatus === "rejected" && (
                                            <div className="mt-1">
                                                <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded-full">
                                                    <XCircle size={10} />
                                                    Return Rejected
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
                                        {!hasAllRequiredTags && tagsEditable && order.fulfillmentStatus !== "cancelled" && order.fulfillmentStatus !== "returned" && (
                                            <button
                                                onClick={() => onAssignTag(order)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                                title={hasAnyTag ? "Add Tag" : "Assign Tag"}
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
                                                title="Process Refund Request"
                                                disabled={processingAction}
                                            >
                                                <RotateCcw size={16} className="text-gray-500 group-hover:text-purple-600" />
                                            </button>
                                        )}

                                        {canReturn(order) && (
                                            <button
                                                onClick={() => onProcessReturn(order)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                                title="Process Return Request"
                                                disabled={processingAction}
                                            >
                                                <Undo2 size={16} className="text-gray-500 group-hover:text-orange-600" />
                                            </button>
                                        )}

                                        {canCompleteReturn(order) && (
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