'use client';

import { Crown, Sparkles } from 'lucide-react';

export default function GreetingSection({ greeting, user, subscription }) {
  const name = greeting?.name || user?.name || 'there';
  const timeGreeting = greeting?.text || 'Welcome';
  const profileImage = user?.profileImage || null;
  const memberSince = user?.memberSince ? new Date(user.memberSince) : null;
  const memberSinceLabel = memberSince
    ? memberSince.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';
  const isPremium = !!subscription?.isPremium || subscription?.plan === 'subscriber';

  return (
    <section className="relative flex h-full w-full items-center justify-between gap-6 overflow-hidden rounded-[24px] border border-white/8 bg-card p-6 sm:p-8 lg:p-10 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.4)]">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-background-secondary/60 via-transparent to-transparent" />
      </div>

      {/* Greeting text */}
      <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[26px] sm:text-[32px] md:text-[38px] lg:text-[42px] leading-[1.15] tracking-tight text-foreground truncate">
            {timeGreeting}, {name}!
          </h1>
          <span className="inline-flex shrink-0 items-center justify-center text-accent">
            <Sparkles size={20} className="w-[18px] h-[18px] sm:w-5 sm:h-5" fill="currentColor" />
          </span>
        </div>

        <p className="mt-2.5 sm:mt-3 text-[14px] sm:text-[15px] md:text-[16px] font-normal tracking-wide text-foreground-secondary">
          Welcome back to your inspiration journey.
        </p>

        {isPremium ? (
          <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-gradient-to-r from-accent/15 to-accent/5 px-4 py-1.5 text-[12px] font-semibold tracking-wide text-accent shadow-[0_0_20px_rgba(253,182,92,0.12)] backdrop-blur-sm">
            <Crown size={13} className="w-3.5 h-3.5" />
            Premium Plan
          </div>
        ) : null}
      </div>

      {/* Profile card */}
      <div className="relative z-10 flex shrink-0 flex-col items-center gap-3 rounded-2xl border border-white/8 bg-background-secondary/50 px-5 py-4 sm:px-6 sm:py-5 backdrop-blur-sm">
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary/30 to-accent/20 blur-md" />
          {profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileImage}
              alt={name}
              className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary/70 text-accent-foreground ring-1 ring-white/10">
              <span className="text-xl sm:text-2xl font-semibold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <p className="max-w-[130px] truncate text-[13px] sm:text-[14px] font-semibold text-foreground">
            {name}
          </p>
          {memberSinceLabel ? (
            <p className="text-[11px] text-foreground-tertiary">
              Member since {memberSinceLabel}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
