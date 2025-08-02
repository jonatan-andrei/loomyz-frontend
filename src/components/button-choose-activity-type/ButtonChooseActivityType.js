export default function ButtonChooseActivityType({icon: Icon, bgClass, name}) {
    return (
        <button
            className={`w-full flex items-center gap-4 ${bgClass} text-white px-5 py-3 rounded-lg transition`}>
            <Icon className="w-5 h-5" />
            <span className="font-medium">{name}</span>
        </button>
    );
}