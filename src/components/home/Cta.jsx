import Link from "next/link";
export default function Cta() {
    return (
        <div className="py-16 bg-[#f4f5f7] rounded-lg flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Ready to Create Your Story ?</h1>
            <p className="text-gray-500 text-lg mb-4">Join thousands of people who carry inspiration with them every day</p>
            <Link href="#" className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition">Start Your Story Now</Link>
        </div>
    )
}
