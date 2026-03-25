// app/dashboard/admin/tags/components/TagsTable.jsx
import { Calendar, ExternalLink, QrCode, User } from "lucide-react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import SubscriptionBadge from "./SubscriptionBadge";

export default function TagsTable({ tags, onShowQR }) {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (tags.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                No tags found
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tag Code</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Owner</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subscription</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Activated At</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {tags.map((tag) => (
                            <tr key={tag._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-sm font-medium text-gray-900">
                                        {tag.tagCode}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {tag.owner ? (
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {tag.owner.name || tag.owner.email}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge tag={tag} />
                                </td>
                                <td className="px-6 py-4">
                                    <SubscriptionBadge type={tag.subscriptionType} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} className="text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {formatDate(tag.createdAt)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">
                                        {tag.activatedAt ? formatDate(tag.activatedAt) : "—"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onShowQR(tag)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                            title="Show QR Code"
                                        >
                                            <QrCode size={18} />
                                        </button>
                                        <Link
                                            href={`/t/${tag.tagCode}`}
                                            target="_blank"
                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                                            title="Open Tag"
                                        >
                                            <ExternalLink size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}