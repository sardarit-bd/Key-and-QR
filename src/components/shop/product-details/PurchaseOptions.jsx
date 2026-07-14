import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const PurchaseOptions = ({
    selectedOption,
    onOptionChange,
    giftMessage,
    onGiftMessageChange,
}) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Choose Your Message
            </h2>

            <div className="space-y-4">
                {/* Self Purchase Option */}
                <button
                    onClick={() => onOptionChange('self')}
                    className={cn(
                        "w-full text-left p-5 rounded-xl border-2 transition-all cursor-pointer",
                        selectedOption === 'self'
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                    aria-pressed={selectedOption === 'self'}
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                selectedOption === 'self' ? "border-gray-900" : "border-gray-300"
                            )}>
                                {selectedOption === 'self' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Purchase for yourself
                            </h3>
                            <p className="text-sm text-gray-500">
                                We'll select a beautiful quote from our collection
                            </p>
                        </div>
                    </div>
                </button>

                {/* Gift Purchase Option */}
                <button
                    onClick={() => onOptionChange('gift')}
                    className={cn(
                        "w-full text-left p-5 rounded-xl border-2 transition-all cursor-pointer",
                        selectedOption === 'gift'
                            ? "border-gray-900 bg-gray-900"
                            : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                    aria-pressed={selectedOption === 'gift'}
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                selectedOption === 'gift' ? "border-white" : "border-gray-300"
                            )}>
                                {selectedOption === 'gift' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className={cn(
                                "font-semibold mb-1",
                                selectedOption === 'gift' ? "text-white" : "text-gray-900"
                            )}>
                                Purchase for Gift
                            </h3>
                            <p className={cn(
                                "text-sm",
                                selectedOption === 'gift' ? "text-gray-300" : "text-gray-500"
                            )}>
                                Personalize with your own words
                            </p>
                        </div>
                    </div>
                </button>

                {/* Gift Message Textarea */}
                {selectedOption === 'gift' && (
                    <div className="animate-fadeIn">
                        <Textarea
                            value={giftMessage}
                            onChange={(e) => onGiftMessageChange(e.target.value)}
                            placeholder="Write something meaningful..."
                            rows={4}
                            className="resize-none"
                            aria-label="Gift message"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOptions;