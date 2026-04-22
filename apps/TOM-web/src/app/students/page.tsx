import {
  CalendarDays,
  ChevronRight,
  Heart,
  MessageCircle,
  PlusCircle,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';

const tabs = ['Browse', 'Feed', 'Events', 'Create'];

const badges = [
  {
    name: 'First Club',
    description: 'Joined your first community',
    icon: Star,
    color: 'from-[#8db8ff] to-[#7aa8f4]',
  },
  {
    name: 'Event Hero',
    description: 'Attended 5 events',
    icon: CalendarDays,
    color: 'from-[#6ad0dc] to-[#63bfd8]',
  },
  {
    name: 'Top Voter',
    description: 'Supported club decisions',
    icon: Heart,
    color: 'from-[#7898ef] to-[#6388e7]',
  },
  {
    name: 'Streaker',
    description: 'Active every week',
    icon: Sparkles,
    color: 'from-[#73c7e9] to-[#62afd8]',
  },
];

const badgeRail = [...badges, ...badges];

const quickActions = [
  {
    title: 'Start a new club',
    description: 'Send a club proposal with your idea, advisor, and mission.',
    icon: PlusCircle,
    accent: 'bg-[#e9f5ff] text-[#3f7ad8]',
    cta: 'Submit request',
  },
  {
    title: 'Post to your community',
    description: 'Share updates, comment on plans, and keep your members engaged.',
    icon: MessageCircle,
    accent: 'bg-[#ecfbff] text-[#20a1bf]',
    cta: 'Create post',
  },
  {
    title: 'Jump into events',
    description: 'RSVP for workshops, game nights, and club meetups this week.',
    icon: CalendarDays,
    accent: 'bg-[#eef1ff] text-[#5f79d8]',
    cta: 'See events',
  },
];

const clubs = [
  {
    name: 'Robotics Lab',
    category: 'STEM',
    members: 42,
    verified: true,
    gradient: 'from-[#79b8f4] to-[#b0befc]',
  },
  {
    name: 'Drama Society',
    category: 'Arts',
    members: 28,
    verified: true,
    gradient: 'from-[#69c8d7] to-[#84c6ef]',
  },
  {
    name: 'Chess Masters',
    category: 'Strategy',
    members: 19,
    verified: false,
    gradient: 'from-[#658be1] to-[#7882db]',
  },
  {
    name: 'Eco Warriors',
    category: 'Community',
    members: 56,
    verified: true,
    gradient: 'from-[#71b8f1] to-[#88caef]',
  },
];

const activityItems = [
  {
    title: 'Club creation request ready',
    detail: 'Art & Design Circle draft is 80% complete.',
  },
  {
    title: '2 new comments on Robotics Lab',
    detail: 'Teammates are planning the weekend build challenge.',
  },
  {
    title: 'Friday event reminder',
    detail: 'Chess Masters rapid tournament starts at 16:30.',
  },
];

export default function StudentDashboard() {
  const xpCurrent = 740;
  const xpGoal = 1000;
  const progress = (xpCurrent / xpGoal) * 100;

  return (
    <main className="min-h-screen sm:px-6 lg:px-8 pt-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="dashboard-entrance overflow-hidden rounded-[34px] ">

          <div className="relative overflow-hidden ">
           
            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_15rem]">
              <section className="dashboard-entrance dashboard-entrance-delay-1 min-w-0 rounded-[30px] bg-gradient-to-r from-[#6fb3f2] via-[#84aef6] to-[#b3aaf6] p-6 text-white shadow-[0_24px_50px_rgba(101,145,233,0.28)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white/80">
                      Welcome back, Jordan
                    </p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-[2rem]">
                      Level 7 · Club Explorer
                    </h1>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                    <Trophy className="h-8 w-8 text-white/95" />
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between text-sm font-medium text-white/85">
                    <span>{xpCurrent} XP</span>
                    <span>{xpGoal} XP</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.45)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/85">
                    260 XP to Level 8
                  </p>
                </div>
              </section>

              <aside className="dashboard-entrance dashboard-entrance-delay-2 w-60 shrink-0 rounded-[30px] border border-[#dbe7f8] bg-white/95 p-6 shadow-[0_18px_45px_rgba(28,69,130,0.08)] backdrop-blur">
                <div className="flex items-center gap-2 text-[#1d355b]">
                  <Trophy className="h-5 w-5 text-[#7f9eea]" />
                  <h2 className="text-lg font-semibold">Badges</h2>
                </div>

                <div className="badge-marquee mt-6">
                  <div className="badge-marquee-track">
                    {badgeRail.map((badge, index) => {
                    const Icon = badge.icon;

                    return (
                      <article
                        key={`${badge.name}-${index}`}
                        className="badge-marquee-item flex min-w-[148px] flex-col items-center rounded-2xl bg-[#fbfdff] px-3 py-3 text-center"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${badge.color} text-white shadow-[0_12px_22px_rgba(111,158,231,0.22)]`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-[#294262]">
                          {badge.name}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#8398b4]">
                          {badge.description}
                        </p>
                      </article>
                    );
                    })}
                  </div>
                </div>
              </aside>
            </div>

            <section className="dashboard-entrance dashboard-entrance-delay-3 mt-6 grid gap-4 lg:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <article
                    key={action.title}
                    className="rounded-[26px] border border-[#dbe8f9] bg-white/90 p-5 shadow-[0_16px_40px_rgba(30,74,138,0.06)]"
                  >
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${action.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[#20395d]">
                      {action.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#6f86a6]">
                      {action.description}
                    </p>
                    <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5e95e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4b85d8]">
                      {action.cta}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </article>
                );
              })}
            </section>
          </div>
        </section>

        <section className="dashboard-entrance dashboard-entrance-delay-4 rounded-[34px] border border-[#d8e6f8] bg-white px-5 py-6 shadow-[0_20px_65px_rgba(22,57,111,0.08)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7c92b0]">
                Student Space
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#183255] sm:text-3xl">
                Browse clubs, join communities, and stay active
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7086a5] sm:text-base">
                Discover clubs, mark the ones you&apos;re interested in, join
                after approval, and build your reputation through events,
                posts, comments, XP, and badges.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    index === 0
                      ? 'bg-white text-[#234064] shadow-[0_8px_20px_rgba(44,88,153,0.14)] ring-1 ring-[#d6e3f7]'
                      : 'text-[#7a90af] hover:bg-[#f3f8ff]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
            <div className="grid gap-5 md:grid-cols-2">
              {clubs.map((club, index) => (
                <article
                  key={club.name}
                  className={`rounded-[28px] border border-[#dce8f8] bg-white shadow-[0_18px_45px_rgba(29,66,123,0.07)] dashboard-entrance ${
                    index === 1
                      ? 'dashboard-entrance-delay-1'
                      : index === 2
                      ? 'dashboard-entrance-delay-2'
                      : index === 3
                      ? 'dashboard-entrance-delay-3'
                      : ''
                  }`}
                >
                  <div
                    className={`rounded-t-[28px] bg-gradient-to-r ${club.gradient} px-5 py-4 text-white`}
                  >
                    <div className="flex justify-end">
                      {club.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#5c8bd9]">
                          <Sparkles className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/90">
                          New club
                        </span>
                      )}
                    </div>
                    <div className="mt-10 h-10" />
                  </div>

                  <div className="px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-semibold text-[#1d355b]">
                          {club.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[#7f94b0]">
                          <Users className="h-4 w-4" />
                          <span>{club.members} members</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c7ea5]">
                        {club.category}
                      </span>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d6e1f2] px-4 py-2.5 text-sm font-semibold text-[#4f6587] transition hover:bg-[#f6f9ff]">
                        <Heart className="h-4 w-4" />
                        Interested
                      </button>
                      <button className="inline-flex flex-1 items-center justify-center rounded-full bg-[#67a2ea] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#568fd8]">
                        Join
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-5">
              <section className="rounded-[28px] border border-[#dce7f8] bg-[linear-gradient(180deg,#f6fbff_0%,#ffffff_100%)] p-5 shadow-[0_18px_48px_rgba(31,73,132,0.06)]">
                <div className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-[#6f8fe3]" />
                  <h3 className="text-lg font-semibold text-[#223b5f]">
                    Activity Quest
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#7086a5]">
                  Complete student tasks to keep leveling up across your club
                  journey.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-[#eef6ff] p-4">
                    <p className="text-sm font-semibold text-[#224064]">
                      Submit a club idea
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#7086a6]">
                      Launch a new club request and earn a creativity bonus.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#eefcfb] p-4">
                    <p className="text-sm font-semibold text-[#224064]">
                      Comment on a post
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#7086a6]">
                      Keep the community active and unlock social XP.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f2f1ff] p-4">
                    <p className="text-sm font-semibold text-[#224064]">
                      Attend this week&apos;s event
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#7086a6]">
                      Show up, participate, and stack event badges.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-[0_16px_44px_rgba(31,73,132,0.06)]">
                <h3 className="text-lg font-semibold text-[#223b5f]">
                  Live activity
                </h3>
                <div className="mt-4 space-y-3">
                  {activityItems.map((item) => (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-[#e7eef8] bg-[#fbfdff] p-4"
                    >
                      <p className="text-sm font-semibold text-[#243f63]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#7c91ad]">
                        {item.detail}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
