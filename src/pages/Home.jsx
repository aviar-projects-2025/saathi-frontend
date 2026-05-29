import React from "react";
import {
  Bell,
  Search,
  Plane,
  Car,
  Landmark,
  UsersRound,
  Home,
  CircleDot,
  User,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Network,
} from "lucide-react";

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-[#FFF8F2] pb-20 text-[#1A1A2E]">
      <div className="mx-auto max-w-[390px] px-4 pt-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://i.pravatar.cc/40?img=12"
              alt="user"
              className="h-8 w-8 rounded-full"
            />
            <h1 className="text-lg font-black text-[#9A4B00]">
              Namaste, Rahul
            </h1>
          </div>

          <Bell size={18} className="text-[#1A1A2E]" />
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            placeholder="Where to, Rahul?"
            className="h-11 w-full rounded-xl border border-[#F0DCC8] bg-white pl-10 pr-4 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Category Cards */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="row-span-2 rounded-xl bg-[#B65300] p-4 text-white shadow-md">
            <Plane size={28} className="mb-6" />
            <h2 className="text-lg font-black">Airport</h2>
            <p className="mt-1 text-[11px] font-semibold text-white/80">
              Reliable terminal drops
            </p>
          </div>

          <button className="flex items-center gap-3 rounded-xl bg-[#EEF3F8] p-3 text-left shadow-sm">
            <div className="rounded-lg bg-[#607D9B] p-2 text-white">
              <Car size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black">Intercity</h3>
              <p className="text-[10px] text-gray-500">Long journeys</p>
            </div>
          </button>

          <button className="flex items-center gap-3 rounded-xl bg-[#FFF5DD] p-3 text-left shadow-sm">
            <div className="rounded-lg bg-[#8A4B00] p-2 text-white">
              <Landmark size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black">Temple</h3>
              <p className="text-[10px] text-gray-500">Spiritual trips</p>
            </div>
          </button>
        </div>

        {/* Parents Card */}
        <div className="mb-6 flex items-center justify-between rounded-xl bg-[#EFEFEF] p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#9A4B00] p-2 text-white">
              <UsersRound size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black">Parents</h3>
              <p className="text-[10px] text-gray-500">
                Verified senior-friendly drivers
              </p>
            </div>
          </div>
          <span className="text-xl text-[#9A4B00]">›</span>
        </div>

        {/* Live Rides */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black">Live Rides</h2>
            <p className="text-xs font-semibold text-gray-500">
              Community members near you
            </p>
          </div>
          <button className="text-xs font-bold text-[#B65300]">See all</button>
        </div>

        {/* Ride Horizontal Cards */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="min-w-[260px] rounded-xl border border-[#F0DCC8] bg-white p-3 shadow-sm"
            >
              <div className="mb-3 flex items-start gap-3">
                <img
                  src={`https://i.pravatar.cc/40?img=${item + 20}`}
                  alt="profile"
                  className="h-10 w-10 rounded-full"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-black">Amit Shah</h3>
                    <span className="rounded-full bg-[#EAF2FF] px-2 py-0.5 text-[9px] font-black text-[#2D6A9F]">
                      VERIFIED
                    </span>
                  </div>

                  <p className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Star size={11} className="fill-[#F4A261] text-[#F4A261]" />
                    4.9 Trust
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <p className="flex items-center gap-2">
                  <MapPin size={13} className="text-[#B65300]" />
                  To: Indira Nagar Work
                </p>

                <p className="flex items-center gap-2">
                  <Clock size={13} className="text-[#B65300]" />
                  Leaving in 15 mins
                </p>
              </div>

              <div className="mt-3 rounded-lg bg-[#FFF5DD] px-3 py-2 text-[11px] font-semibold text-[#9A4B00]">
                🤝 Referred by Meena R.
              </div>

              <button className="mt-3 w-full rounded-lg bg-[#B65300] py-2 text-sm font-black text-white">
                Request Ride
              </button>
            </div>
          ))}
        </div>

        {/* Trust Network */}
        <div className="rounded-xl bg-[#241812] p-5 text-white shadow-lg">
          <h2 className="text-lg font-black">Saathi Trust Network</h2>
          <p className="mt-2 text-sm text-white/80">
            Every member is verified through a 3-step community check.
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} /> ID Check
            </span>
            <span className="flex items-center gap-1">
              <Network size={14} /> Network
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[#E8D8C8] bg-white">
        <div className="mx-auto grid max-w-[390px] grid-cols-4 py-2 text-center">
          <button className="flex flex-col items-center gap-1 text-[#5B8DB8]">
            <div className="rounded-full bg-[#E8F2FF] px-4 py-1">
              <Home size={16} />
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-gray-500">
            <Search size={16} />
            <span className="text-[10px] font-bold">Find Rides</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-gray-500">
            <CircleDot size={16} />
            <span className="text-[10px] font-bold">Post</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-gray-500">
            <User size={16} />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}