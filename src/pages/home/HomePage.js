import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import PageWrapper from "../../components/page-wrapper/PageWrapper";
import './HomePage.css';
import { useEffect } from "react";
import { useAuth } from "../../AuthContexts";
import { verifyExistsPendingRegistration } from "../../services/httpService";

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            setRedirection();
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            setRedirection();
        } catch (error) {
            console.error("Erro no login", error);
        }
    };

    const setRedirection = async () => {
        try {
            const user = auth.currentUser;
            const existsPendingRegistration = await verifyExistsPendingRegistration(user);
            if (existsPendingRegistration) {
                navigate("/edit-profile");
            } else {
                navigate("/choose-activity-type");
            }
        } catch (error) {
            console.error("Failed to load exists pending registration: ", error);
            navigate("/");
        }
    };

    return (
            <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white min-h-screen flex items-center justify-center px-4 principal">

                <div className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden grid grid-cols-1 md:grid-cols-2">

                    <div className="p-8 flex flex-col justify-center bg-purple-700 text-white">
                        <h1 className="text-4xl font-bold mb-4">Welcome to <span className="text-yellow-300">Loomyz</span>!</h1>
                        <p className="text-lg mb-6">Learn English through fun and interactive exercises using the power of spaced repetition.</p>
                        <ul className="space-y-2 text-sm">
                            <li>✅ <span className="font-bold">Read</span> and expand your vocabulary</li>
                            <li>✅ <span className="font-bold">Listen</span> to native pronunciation</li>
                            <li>✅ <span className="font-bold">Write</span> better and faster</li>
                            <li>✅ <span className="font-bold">Speak</span> and improve your fluency</li>
                        </ul>
                    </div>

                    <div className="p-8 bg-white flex flex-col justify-center">
                        <h2 className="text-2xl font-semibold text-center mb-6">Log in or sign up</h2>

                        <button onClick={handleLogin} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition duration-200">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            Continue with Google
                        </button>

                    </div>
                </div>

            </div>
    );
}