import PageWrapper from "../../components/page-wrapper/PageWrapper";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContexts";
import { useNavigate } from "react-router-dom";
import { getActivities, saveFlashcard, skipFlashcard, validateTextActivity } from "../../services/httpService";
import LoadingPage from "../../components/loading-page/LoadingPage";
import { toast } from "react-hot-toast";

export default function CompletedActivity() {
    const [activities, setActivities] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userAnswer, setUserAnswer] = useState("");
    const [isCorrect, setIsCorrect] = useState(false);
    const [isError, setIsError] = useState(false);
    const [validating, setValidating] = useState(false);
    const { type } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showSkipModal, setShowSkipModal] = useState(false);

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
            answer: answer,
            originalText: ['WRITING'].includes(activity.activityType)
                ? activity.translation
                : activity.text
        };
        setValidating(true);
        try {
            const result = await validateTextActivity(user, activity.activityId, payload);
            setIsError(false);
            setIsCorrect(result);
        } catch (error) {
            console.error("Failed to validate translation: ", error);
            setIsError(true);
        } finally {
            setValidating(false);
            setShowAnswer(true);
        }
    };

    const handleSkipActivity = async () => {
        setShowSkipModal(false);
        try {
            await skipFlashcard(user, activities[currentIndex].activityId);
            handleNext(activities[currentIndex], null, true);
        } catch (error) {
            console.error("Failed to skip flashcard: ", error);
            toast.error("Failed to skip activity. Please try again.");
        }
    };

    const handleNext = (activity, option) => {
        if (currentIndex < activities.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setShowAnswer(false);
            setUserAnswer("");
            setIsCorrect(false);
        } else {
            navigate("/completed-activity/" + type);
        }

        if (option) {
            const payload = {
                flashcardId: activity.flashcardId,
                activityType: activity.activityType,
                response: option.responseType,
                repetitionCount: option.repetitionCount,
                intervalInDays: option.intervalInDays,
                easinessFactor: option.easinessFactor,
            };
            saveFlashcard(user, activity.activityId, payload).catch((error) => {
                console.error("Failed to update flashcard: ", error);
            });
        }
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
                                    {!isError &&
                                        <div
                                            className={`p-3 rounded-md mb-4 font-medium ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {isCorrect ? "✅ Correct!" : "❌ Incorrect."}
                                        </div>
                                    }

                                    <div className="p-3 rounded-md bg-gray-100 text-gray-800 mb-3">
                                        <span className="font-semibold">Your answer:</span> {userAnswer}
                                    </div>

                                    <div className="p-3 rounded-md bg-purple-50 text-purple-800">
                                        <span className="font-semibold">Correct answer:</span>{" "}
                                        {['TRANSLATING_TEXT', 'TRANSLATING_AUDIO'].includes(activity.activityType) && activity.translation}
                                        {['WRITING', 'TRANSCRIBING'].includes(activity.activityType) && activity.text}
                                    </div>
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
                                            onClick={() => handleNext(activity, option, false)}
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

                    {type === "review" && !showAnswer && (
                        <div className="flex justify-end mt-4">
                            <button
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                                onClick={() => setShowSkipModal(true)}
                            >
                                Skip this activity (review tomorrow)
                            </button>
                        </div>
                    )}

                    {showSkipModal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                            <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">Confirm Skip</h3>
                                <p className="text-gray-700 mb-6">Are you sure you want to skip this activity?<br/> It will be reviewed tomorrow.</p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowSkipModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSkipActivity}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                                    >
                                        Confirm Skip
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </PageWrapper>
    );
}
