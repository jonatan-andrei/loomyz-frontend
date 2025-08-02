import PageWrapper from "../../components/page-wrapper/PageWrapper";
import { useState, useEffect } from "react";

export default function EditProfile() {
    const [nativeLanguages, setNativeLanguages] = useState([]);
    const [name, setName] = useState("");
    const [nativeLanguage, setNativeLanguage] = useState("");
    const [level, setLevel] = useState("");

    useEffect(() => {
        const fetchNativeLanguages = async () => {
            try {
                const response = await fetch("http://localhost:8099/native-language/1");
                if (!response.ok) {
                    throw new Error("Failed to load native languages");
                }
                const data = await response.json();
                setNativeLanguages(data);
            } catch (error) {
                console.error("Failed to load native languages:", error);
            }
        };
        fetchNativeLanguages();
    }, []);

    const isFormValid = String(name).trim().length > 0 &&
        String(nativeLanguage).trim().length > 0 &&
        String(level).trim().length > 0;

    const handleSubmit = (e) => {
        console.log(isFormValid)
        e.preventDefault();
        // Lógica para salvar os dados
        console.log("Formulário enviado com sucesso!");
        console.log("Nome:", name);
        console.log("Idioma Nativo:", nativeLanguage);
        console.log("Nível:", level);
    };

    return (
        <PageWrapper>
            <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 min-h-screen text-white">

                <header className="p-4">
                    <a href="index.html" className="text-xl font-bold text-white hover:text-yellow-300 transition">Loomyz</a>
                </header>

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
                                disabled={!isFormValid}
                                className={`w-full text-white px-4 py-2 rounded-md font-medium transition ${isFormValid
                                    ? "bg-purple-700 hover:bg-purple-800"
                                    : "bg-gray-400 cursor-not-allowed"
                                    }`}>
                                Save
                            </button>
                        </form>
                    </div>
                </main>
            </div>

        </PageWrapper>
    )
}