"use client";

import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
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
                                <Facebook size={16} />
                            </Link>
                            <Link href="#" className="p-2 rounded-full border border-gray-500 hover:bg-white hover:text-black transition">
                                <Instagram size={16} />
                            </Link>
                            <Link href="#" className="p-2 rounded-full border border-gray-500 hover:bg-white hover:text-black transition">
                                <Twitter size={16} />
                            </Link>
                            <Link href="#" className="p-2 rounded-full border border-gray-500 hover:bg-white hover:text-black transition">
                                <Linkedin size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Products</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white transition">Shop</Link></li>
                            <li><Link href="#" className="hover:text-white transition">How it works</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Subscription</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Business Consultancy</Link></li>
                        </ul>
                    </div>

                    {/* Useful Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Useful Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Our Products</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Testimonials</Link></li>
                            <li><Link href="#" className="hover:text-white transition">Our Blogs</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact Info</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <Phone size={16} className="text-white border-white" />
                                <span>+1234567889</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={16} className="text-white border-white" />
                                <span>debra.holt@gmail.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={16} className="text-white border-white  mt-1" />
                                <span>4140 Parker Rd. Allentown, New Mexico</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between text-sm text-gray-400">
                    <p>All Rights Reserved © 2025</p>
                    <div className="flex space-x-4 mt-3 md:mt-0">
                        <Link href="#" className="hover:text-white transition">Terms & Conditions</Link>
                        <span>|</span>
                        <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
