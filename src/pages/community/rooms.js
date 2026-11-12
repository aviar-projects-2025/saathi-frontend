// Single source of truth for rooms + sub-categories.
// (Moved out of Community.jsx to avoid circular imports with CreatePostModal / RoomDetails.)

export const ROOMS = [
    { id: "immigration", label: "Immigration", icon: "📄", color: "#E3F2FD" },
    { id: "schools_kids", label: "Schools & Kids", icon: "🎓", color: "#FFF3E0" },
    { id: "housing", label: "Housing", icon: "🏠", color: "#E8F5E9" },
    { id: "automobiles", label: "Automobiles", icon: "🚗", color: "#F3E5F5" },
    { id: "services", label: "Services", icon: "🛠️", color: "#FFEBEE" },
    { id: "events", label: "Events", icon: "📅", color: "#FCE4EC" },
];

export const GENERAL_ROOM = { id: "general", label: "General", icon: "💬", color: "#F5F5F5" };

// Rooms + General (used by the "Which room?" picker)
export const ALL_ROOMS = [...ROOMS, GENERAL_ROOM];

export const SUB_CATEGORIES = {
    housing: ["All", "Home services", "Renting out", "Shared housing"],
    immigration: ["All", "H-1B", "Green Card", "F-1/OPT", "H-4/EAD"],
    schools_kids: ["All", "Tutoring", "Schools", "Activities"],
};

export const getRoom = (id) => ALL_ROOMS.find((r) => r.id === id) || GENERAL_ROOM;
