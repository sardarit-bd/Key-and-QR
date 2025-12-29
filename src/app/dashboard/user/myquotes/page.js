'use client'



import { CreditCard, Heart, Package, QrCode, Settings, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function Myquotes() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [category, setcategory] = useState("motivation")

    const menuItems = [
        { icon: Package, label: 'Dashboard', active: true },
        { icon: ShoppingBag, label: 'My Orders', active: false },
        { icon: Heart, label: 'Favorites', active: false },
        { icon: QrCode, label: 'QR History', active: false },
        { icon: CreditCard, label: 'Subscription', active: false },
        { icon: Settings, label: 'Account Settings', active: false },
    ];

    const orders = [
        { id: 'ORD-001', date: '11/10/2025', item: 'Digital Keychain', amount: '$32.032', status: 'Delivered' },
        { id: 'ORD-002', date: '11/10/2025', item: 'Digital Keychain', amount: '$32.032', status: 'Delivered' },
    ];

    return (

        <>
            {/* Main Content */}
            < main className="flex-1 w-full">
                <div className="p-4 lg:p-8">





                    {/* Daily Quote */}
                    <div className="bg-white rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200 text-center">
                        <div className="flex flex-col items-center justify-between mb-3">
                            <span className="text-xs bg-gray-100 px-2 lg:px-3 mb-4 py-1 rounded-full text-gray-600 flex items-center gap-1">
                                <span className="text-base lg:text-lg">Motivation</span>
                            </span>
                            <h2 className="font-semibold text-gray-900 text-sm lg:text-lg">Your Quote</h2>

                        </div>
                        <p className="text-sm lg:text-base text-center text-gray-700 italic mb-2">
                            "Happiness can be found even in the darkest of times, if one only remembers to turn on the light."
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500 text-center">— J.K. Rowling</p>
                    </div>














                    <div className='bg-green-100 rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200'>
                        <div className='flex flex-col md:flex-row gap-5 items-center justify-center'>

                            <button className='border border-gray-300 px-4 bg-blue-600 text-white py-2 w-full rounded-lg cursor-pointer font-semibold focus:outline-none'>
                                Save
                            </button>


                            <select onChange={(e) => { setcategory(e.target.value) }} className='border border-gray-300 font-semibold px-4 bg-yellow-600 text-white py-2 w-full rounded-lg cursor-pointer focus:outline-none' name="quote_category" id="quote_category">
                                <option value="motivation">Select Quote Category</option>


                                <option value="motivation">Motivation</option>
                                <option value="inspiration">Inspiration</option>
                                <option value="success">Success</option>
                                <option value="life">Life</option>
                                <option value="happiness">Happiness</option>
                                <option value="wisdom">Wisdom</option>
                                <option value="positivity">Positivity</option>
                                <option value="growth">Growth</option>


                                <option value="love">Love</option>
                                <option value="friendship">Friendship</option>
                                <option value="family">Family</option>
                                <option value="relationships">Relationships</option>
                                <option value="kindness">Kindness</option>
                                <option value="gratitude">Gratitude</option>


                                <option value="leadership">Leadership</option>
                                <option value="hard_work">Hard Work</option>
                                <option value="discipline">Discipline</option>
                                <option value="productivity">Productivity</option>
                                <option value="business">Business</option>
                                <option value="career">Career</option>


                                <option value="philosophy">Philosophy</option>
                                <option value="spirituality">Spirituality</option>
                                <option value="truth">Truth</option>
                                <option value="purpose">Purpose</option>
                                <option value="time">Time</option>
                                <option value="change">Change</option>


                                <option value="health">Health</option>
                                <option value="mental_health">Mental Health</option>
                                <option value="self_care">Self Care</option>
                                <option value="confidence">Confidence</option>
                                <option value="freedom">Freedom</option>


                                <option value="humor">Humor</option>
                                <option value="short_quotes">Short Quotes</option>
                                <option value="famous_quotes">Famous Quotes</option>
                                <option value="daily_quotes">Daily Quotes</option>
                            </select>







                            <button className='border border-gray-300 px-4 bg-red-600 font-semibold text-white py-2 w-full rounded-lg cursor-pointer focus:outline-none'>
                                Get Another
                            </button>

                        </div>
                    </div>








                </div>
            </main >

        </>
    );
}