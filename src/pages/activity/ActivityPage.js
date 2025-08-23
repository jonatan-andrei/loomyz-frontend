import PageWrapper from "../../components/page-wrapper/PageWrapper";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContexts";
import { useNavigate } from "react-router-dom";
import { getActivities, saveFlashcard, validateTextActivity } from "../../services/httpService";
import LoadingPage from "../../components/loading-page/LoadingPage";

export default function CompletedActivity() {
    const [activities, setActivities] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userAnswer, setUserAnswer] = useState("");
    const [isCorrect, setIsCorrect] = useState(false);
    const [validating, setValidating] = useState(false);
    const { type } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const activitiesResponse = await getActivities(user, type);
                setActivities(activitiesResponse.activities);
            } catch (error) {
                console.error("Failed to load activities: ", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [user, navigate, type]);

    const playAudio = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    };

    const handleReveal = () => {
        setShowAnswer(true);
    };

    const handleValidateText = async (activity, answer) => {
        const payload = {
            activityType: activity.activityType,
            answer: answer
        };
        setValidating(true);
        try {
            const result = await validateTextActivity(user, activity.activityId, payload);
            setIsCorrect(result);
            setShowAnswer(true);
        } catch (error) {
            console.error("Failed to validate translation: ", error);
        } finally {
            setValidating(false);
        }
    };

    const handleNext = (activity, option) => {
        const payload = {
            flashcardId: activity.flashcardId,
            activityType: activity.activityType,
            response: option.responseType,
            repetitionCount: option.repetitionCount,
            intervalInDays: option.intervalInDays,
            easinessFactor: option.easinessFactor
        };

        if (currentIndex < activities.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setShowAnswer(false);
            setUserAnswer("");
            setIsCorrect(false);
        } else {
            navigate("/completed-activity/" + type);
        }

        saveFlashcard(user, activity.activityId, payload).catch((error) => {
            console.error("Failed to update flashcard: ", error);
        });
    };

    if (loading) {
        return <LoadingPage />;
    }

    const activity = activities[currentIndex];

    return (
        <PageWrapper>
            <main className="flex flex-col items-center justify-center px-4 py-10">
                <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 max-w-3xl w-full text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        {['READING', 'TRANSLATING_TEXT'].includes(activity.activityType) &&
                            <p className="text-xl font-semibold">{activity?.text}</p>
                        }
                        {['LISTENING', 'TRANSLATING_AUDIO'].includes(activity.activityType) && showAnswer &&
                            <p className="text-xl font-semibold">{activity?.text}</p>
                        }
                        {['WRITING'].includes(activity.activityType) &&
                            <p className="text-xl font-semibold">{activity?.translation}</p>
                        }
                        {['READING', 'TRANSLATING_TEXT', 'LISTENING', 'TRANSLATING_AUDIO', 'TRANSCRIBING'].includes(activity.activityType) &&
                            <button
                                onClick={() => playAudio(activity?.text)}
                                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition"
                            >
                                🔊
                            </button>
                        }
                    </div>

                    {!showAnswer && ['READING', 'LISTENING'].includes(activity.activityType) && (
                        <button
                            onClick={handleReveal}
                            className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-md transition font-medium"
                        >
                            Show Translation
                        </button>
                    )}

                    {!showAnswer &&
                        ['TRANSLATING_TEXT', 'TRANSLATING_AUDIO', 'WRITING', 'TRANSCRIBING'].includes(activity.activityType) && (
                            <div className="flex flex-col items-center gap-3">
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder={{
                                        TRANSLATING_TEXT: "Type the translation in your language...",
                                        TRANSLATING_AUDIO: "Type the translation in your language...",
                                        WRITING: "Type the sentence in English...",
                                        TRANSCRIBING: "Type the sentence in English..."
                                    }[activity.activityType]}
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-md"
                                />
                                <button
                                    disabled={!userAnswer || validating}
                                    onClick={() => handleValidateText(activity, userAnswer)}
                                    className="px-5 py-2 rounded-md font-medium transition 
                                bg-purple-700 hover:bg-purple-800 text-white 
                                disabled:bg-purple-400 disabled:cursor-not-allowed disabled:hover:bg-purple-400"
                                >
                                    {validating ? "Validating..." : "Validate"}
                                </button>
                            </div>
                        )}

                    {showAnswer && (
                        <div className="mt-6">
                            {['TRANSLATING_TEXT', 'TRANSLATING_AUDIO', 'WRITING', 'TRANSCRIBING'].includes(activity.activityType) && (
                                <>
                                    {isCorrect ? (
                                        <div className="p-3 rounded-md bg-green-100 text-green-700 font-medium mb-4">
                                            ✅ Correct! Your answer: <span className="font-semibold">{userAnswer}</span>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-md bg-red-100 text-red-700 font-medium mb-4">
                                            ❌ Incorrect. Correct answer:<br />
                                            {['TRANSLATING_TEXT', 'TRANSLATING_AUDIO'].includes(activity.activityType) && <span className="font-semibold">{activity.translation}</span>}
                                            {['WRITING', 'TRANSCRIBING'].includes(activity.activityType) && <span className="font-semibold">{activity.text}</span>}
                                        </div>
                                    )}
                                </>
                            )}

                            {['READING', 'LISTENING'].includes(activity.activityType) && (
                                <p className="text-lg font-medium mb-4 text-green-700">
                                    {activity.translation}
                                </p>
                            )}

                            <div className="flex flex-col md:flex-row gap-3 justify-center mt-8">
                                {activity.options
                                .filter(option => !(isCorrect && option.responseType === "INCORRECT"))
                                .map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleNext(activity, option)}
                                        className={`${option.responseType === "INCORRECT"
                                            ? "bg-red-500 hover:bg-red-600"
                                            : option.responseType === "HARD"
                                                ? "bg-yellow-400 hover:bg-yellow-500"
                                                : option.responseType === "GOOD"
                                                    ? "bg-green-600 hover:bg-green-700"
                                                    : option.responseType === "VERY_EASY"
                                                        ? "bg-blue-400 hover:bg-blue-500"
                                                        : "bg-gray-400 hover:bg-gray-500"
                                            } text-white px-4 py-2 rounded-md flex flex-col items-center md:flex-1 md:max-w-[160px]`}
                                    >
                                        <span className="text-base font-semibold">{option.description}</span>
                                        <span className="text-sm">{option.intervalDescription}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </PageWrapper>
    );
}
