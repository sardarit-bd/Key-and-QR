import Link from "next/link";

export default function PageHeader({ title, breadcrumbs = [] }) {
    return (
        <section
            className="relative h-[300px] bg-[url('/shop/banner.png')] bg-cover bg-center flex flex-col items-center justify-center text-center px-4"
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Content */}
            <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                    {title}
                </h1>

                {/* Dynamic Breadcrumbs */}
                <p className="text-gray-200 text-sm md:text-base">
                    {breadcrumbs.map((item, index) => (
                        <span key={index}>
                            <Link
                                href={item.href}
                                className={`${index === breadcrumbs.length - 1
                                        ? "text-white font-semibold cursor-default"
                                        : "hover:text-white/90 transition"
                                    }`}
                            >
                                {item.label}
                            </Link>
                            {index < breadcrumbs.length - 1 && (
                                <span className="text-gray-400 mx-1">&gt;</span>
                            )}
                        </span>
                    ))}
                </p>
            </div>
        </section>
    );
}
