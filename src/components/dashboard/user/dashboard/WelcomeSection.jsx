'use client';

export default function WelcomeSection({ userName = "Dd" }) {
  return (
    <section className="flex flex-col justify-center w-full h-full">
      <div className="max-w-xl">
        <h1 className="font-serif text-[28px] sm:text-[32px] md:text-[36px] lg:text-[42px] leading-[1.2] tracking-wide text-[#F8F3EA] break-words">
          Good Evening, {userName}!
          <span className="ml-2 inline-block text-[#FDB65C]">
            ✨
          </span>
        </h1>

        <p className="mt-2 sm:mt-3 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] font-normal text-[#B78D69]">
          Welcome back to your inspiration journey.
        </p>
      </div>
    </section>
  );
}