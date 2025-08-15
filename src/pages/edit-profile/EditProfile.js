import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/page-wrapper/PageWrapper";
import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContexts";
import { updateUser, getNativeLanguages } from "../../services/httpService";
import { toast } from "react-hot-toast";

export default function EditProfile() {
    const [nativeLanguages, setNativeLanguages] = useState([]);
    const [name, setName] = useState("");
    const [nativeLanguage, setNativeLanguage] = useState("");
    const [level, setLevel] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const isFormValid = String(name).trim().length > 0 &&
        String(nativeLanguage).trim().length > 0 &&
        String(level).trim().length > 0;

    useEffect(() => {
        const fetchNativeLanguages = async () => {
            try {
                const nativeLanguages = await getNativeLanguages();
                setNativeLanguages(nativeLanguages);
            } catch (error) {
                console.error("Failed to load native languages:", error);
            }
        };
        fetchNativeLanguages();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            userName: name,
            languageId: 1,
            nativeLanguageId: nativeLanguage,
            languageLevel: level,
        };

        try {
            await updateUser(user, payload);
            toast.success("Profile saved!");
            navigate("/choose-activity-type");
        } catch (error) {
            toast.error("Failed to save profile. Try again in a few minutes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageWrapper>
                <main className="flex items-center justify-center px-4 py-10">
                    <div className="bg-white text-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md">
                        <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>

                        <form id="profileForm" className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block font-medium mb-1">Your name</label>
                                <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>

                            <div>
                                <label className="block font-medium mb-1">Native language</label>
                                <select
                                    id="nativeLanguage"
                                    value={nativeLanguage}
                                    onChange={(e) => setNativeLanguage(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option disabled value=""></option>
                                    {nativeLanguages && nativeLanguages.nativeLanguages && nativeLanguages.nativeLanguages.map((nl) => (
                                        <option key={nl.nativeLanguageId} value={nl.nativeLanguageId}>
                                            {nl.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium mb-1">Choose your english level</label>
                                <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} required
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option disabled value=""></option>
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </select>
                            </div>

                            <button type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className={`w-full text-white px-4 py-2 rounded-md font-medium transition ${isFormValid && !isSubmitting
                                    ? "bg-purple-700 hover:bg-purple-800"
                                    : "bg-gray-400 cursor-not-allowed"
                                    }`}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </button>
                        </form>
                    </div>
                </main>
        </PageWrapper>
    )
}