"use client";

import {
    Mail,
    MapPin,
    Phone
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#1E1E1E] text-gray-300 py-14">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

                    {/* Brand */}
                    <div>
                        <div className="mb-4 w-[80px] bg-white p-2 rounded-full">
                            <Image src="/logo.png" alt="logo" width={80} height={80} />
                        </div>

                        <p className="text-sm leading-relaxed mb-6 text-gray-400">
                            Mean if he they been no hold mr. Is at much do made took held help.
                            Latter person am secure of estate genius at.
                        </p>

                        <div className="flex space-x-3">
                            <Link href="#" className="p-2 rounded-full border border-gray-500 hover:bg-white hover:text-black transition">
                                <FaFacebook size={16} />
                            </Link>
                            <Link href="#" className="p-2 rounded-full border border-gray-500 hover:bg-white hover:text-black transition">
                                <FaInstagram size={16} />
                            </Link>
                            <Link href="#" className="p-2 rounded-full border border-gray-500 hover:bg-white hover:text-black transition">
                                <FaTwitter size={16} />
                            </Link>
                            <Link href="#" className="p-2 rounded-full border border-gray-500 hover:bg-white hover:text-black transition">
                                <FaLinkedin size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* باقی কোড একই থাকবে */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Products</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#">Shop</Link></li>
                            <li><Link href="#">How it works</Link></li>
                            <li><Link href="#">Subscription</Link></li>
                            <li><Link href="#">Business Consultancy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Useful Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#">About Us</Link></li>
                            <li><Link href="#">Our Products</Link></li>
                            <li><Link href="#">Testimonials</Link></li>
                            <li><Link href="#">Our Blogs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact Info</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <Phone size={16} />
                                <span>+1234567889</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={16} />
                                <span>debra.holt@gmail.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={16} className="mt-1" />
                                <span>4140 Parker Rd. Allentown, New Mexico</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between text-sm text-gray-400">
                    <p>All Rights Reserved © 2025</p>
                    <div className="flex space-x-4 mt-3 md:mt-0">
                        <Link href="#">Terms & Conditions</Link>
                        <span>|</span>
                        <Link href="#">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}