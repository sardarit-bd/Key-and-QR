'use client';

export default function WelcomeSection({ userName = "Dd" }) {
  return (
    <section className="flex flex-col justify-center w-full h-full">
      <div className="max-w-xl">
        <h1
          className="
            font-serif
            text-[36px]
            md:text-[42px]
            leading-[1.2]
            tracking-wide
            text-[#F8F3EA]
          "
        >
          Good Evening, {userName}!
          <span className="ml-2 inline-block text-[#FDB65C]">
            ✨
          </span>
        </h1>

        <p
          className="
            mt-3
            text-[16px]
            md:text-[17px]
            font-normal
            text-[#B78D69]
          "
        >
          Welcome back to your inspiration journey.
        </p>
      </div>
    </section>
  );
}