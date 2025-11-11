import PageWrapper from "../../components/page-wrapper/PageWrapper";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../AuthContexts";
import { useNavigate } from "react-router-dom";
import { getActivities, saveFlashcard, skipFlashcard, validateActivity } from "../../services/httpService";
import { formatDateToString } from "../../services/DateFormatService";
import LoadingPage from "../../components/loading-page/LoadingPage";
import { toast } from "react-hot-toast";
import { Mic, Square } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

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
    const [recognition, setRecognition] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [validateOnEnd, setValidateOnEnd] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioInstanceRef = useRef(null);
    const onAudioPlay = useCallback(() => setIsPlaying(true), []);
    const onAudioEnded = useCallback(() => setIsPlaying(false), []);

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

    useEffect(() => {
        const activity = activities[currentIndex];

        if (audioInstanceRef.current) {
            audioInstanceRef.current.pause();
            audioInstanceRef.current.removeEventListener('play', onAudioPlay);
            audioInstanceRef.current.removeEventListener('ended', onAudioEnded);
            audioInstanceRef.current = null;
        }

        const autoPlayTypes = [
            'READING',
            'TRANSLATING_TEXT',
            'LISTENING',
            'TRANSLATING_AUDIO',
            'TRANSCRIBING'
        ];

        const delayedAudioTypes = ['PRONUNCIATION', 'SPEAKING'];

        const shouldLoadAudio =
            activity?.audioLink &&
            (autoPlayTypes.includes(activity.activityType) ||
                (delayedAudioTypes.includes(activity.activityType) && showAnswer));

        if (shouldLoadAudio) {
            const audio = new Audio(activity.audioLink);

            const onAudioPlay = () => setIsPlaying(true);
            const onAudioEnded = () => setIsPlaying(false);

            audio.addEventListener('play', onAudioPlay);
            audio.addEventListener('ended', onAudioEnded);
            audio.addEventListener('pause', onAudioEnded);
            audio.addEventListener('error', onAudioEnded);

            audioInstanceRef.current = audio;

            if (autoPlayTypes.includes(activity.activityType) && !showAnswer) {
                const timeoutId = setTimeout(() => {
                    audio.play().catch(error => {
                        console.error("Error playing audio automatically:", error);
                    });
                }, 200);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [activities, currentIndex, showAnswer]);

    const playAudio = () => {
        if (audioInstanceRef.current) {
            if (isPlaying) {
                audioInstanceRef.current.pause();
            } else {
                audioInstanceRef.current.play().catch(error => {
                    console.error("Error playing audio:", error);
                });
            }
        }
    };

    const handleReveal = () => {
        setShowAnswer(true);
    };

    const handleValidateText = async (activity, answer) => {
        const payload = {
            activityType: activity.activityType,
            answer: answer,
            originalText: ['WRITING', 'SPEAKING'].includes(activity.activityType)
                ? activity.translation
                : activity.text
        };
        setValidating(true);
        try {
            const result = await validateActivity(user, activity.activityId, payload);
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
            handleNext(activities[currentIndex], null, false);
        } catch (error) {
            console.error("Failed to skip flashcard: ", error);
            toast.error("Failed to skip activity. Please try again.");
        }
    };

    const handleNext = (activity, option, isRetry) => {
        if (audioInstanceRef.current) {
            audioInstanceRef.current.pause();
            audioInstanceRef.current.currentTime = 0;
            setIsPlaying(false);
        }
        if (!isRetry) {
            if (currentIndex < activities.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setIsCompleted(true);
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
                    userAnswer: userAnswer,
                    llmAnswer: isError ? "ERROR" : isCorrect ? "CORRECT" : "INCORRECT",
                    userReviewDate: formatDateToString(new Date())
                };
                saveFlashcard(user, activity.activityId, payload).catch((error) => {
                    console.error("Failed to update flashcard: ", error);
                });
            }
        }
        setShowAnswer(false);
        setUserAnswer("");
        setIsCorrect(false);
        setIsError(false);
    };

    const startSpeechRecognition = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                toast.error("Speech recognition not supported in this browser. For best results, please use Google Chrome.");
                return;
            }

            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.lang = "en-US";
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.maxAlternatives = 1;

            setRecognition(recognitionInstance);
            setIsRecording(true);
            setUserAnswer('');
            setIsError(false);

            let allTranscripts = [];

            recognitionInstance.onresult = (event) => {

                const lastResult = event.results[event.results.length - 1];

                if (lastResult.isFinal) {
                    const transcript = lastResult[0].transcript.trim();

                    if (transcript && !allTranscripts.includes(transcript)) {
                        allTranscripts.push(transcript);
                    }
                }
            };

            recognitionInstance.onend = () => {
                setIsRecording(false);
                setValidating(true);
                const finalText = allTranscripts.join(' ').trim();
                setUserAnswer(finalText);
                setValidateOnEnd(true);
            };

            recognitionInstance.onerror = (err) => {
                if (err?.error === "not-allowed") {
                    toast.error("We need access to your microphone to start this activity. Please allow microphone permissions in your browser settings and try again.");
                } else {
                    toast.error("We couldn't detect your voice. Please try again.");
                }
                console.error("Speech recognition error: ", err);
                setIsRecording(false);
                setValidating(false);
                setIsError(true);
            };

            recognitionInstance.start();

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong with the speech recognition. For best results, please use Google Chrome.");
            setIsRecording(false);
            setValidating(false);
            setIsError(true);
        }
    };

    const stopSpeechRecognition = () => {
        if (recognition) {
            recognition.stop();
        }
    };

    const activity = activities[currentIndex];

    useEffect(() => {
        if (validateOnEnd) {
            setValidateOnEnd(false);

            if (isError) {
                setValidating(false);
                setShowAnswer(true);
            } else {
                handleValidateText(activity, userAnswer);
            }
        }
    }, [isError, userAnswer, validateOnEnd, activity, handleValidateText]);

    useEffect(() => {
        return () => {
            if (audioInstanceRef.current) {
                audioInstanceRef.current.pause();
                audioInstanceRef.current.removeEventListener('play', onAudioPlay);
                audioInstanceRef.current.removeEventListener('ended', onAudioEnded);
                audioInstanceRef.current.removeEventListener('pause', onAudioEnded);
                audioInstanceRef.current.removeEventListener('error', onAudioEnded);
                audioInstanceRef.current.currentTime = 0;
                audioInstanceRef.current.src = '';
                audioInstanceRef.current = null;
            }
            setIsPlaying(false);
        };
    }, [onAudioPlay, onAudioEnded]);

    if (loading || !activities) {
        return <LoadingPage />;
    }

    return (
        <PageWrapper>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <main className="flex flex-col items-center justify-center px-4 py-10">
                        <div className="w-full max-w-[300px] mb-6 mx-auto">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-white/80">
                                    Activity {currentIndex + 1} of {activities.length}
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className="bg-purple-500 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: isCompleted
                                            ? "100%"
                                            : `${(currentIndex / activities.length) * 100}%`
                                    }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                        <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 max-w-3xl w-full text-center">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                {['READING', 'TRANSLATING_TEXT', 'PRONUNCIATION'].includes(activity.activityType) &&
                                    <p className="text-xl font-semibold">{activity?.text}</p>
                                }
                                {['LISTENING', 'TRANSLATING_AUDIO'].includes(activity.activityType) && showAnswer &&
                                    <p className="text-xl font-semibold">{activity?.text}</p>
                                }
                                {['WRITING', 'SPEAKING'].includes(activity.activityType) &&
                                    <p className="text-xl font-semibold">{activity?.translation}</p>
                                }
                                {['READING', 'TRANSLATING_TEXT', 'LISTENING', 'TRANSLATING_AUDIO', 'TRANSCRIBING'].includes(activity.activityType) &&
                                    <button
                                        aria-label="Play audio"
                                        onClick={playAudio}
                                        className={`
                                            p-2 rounded-full transition
                                            ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}
                                            text-white
                                        `}
                                    >
                                        {isPlaying ? '⏹️' : '🔊'}
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
                                            maxLength="500"
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

                            {!showAnswer &&
                                ['PRONUNCIATION', 'SPEAKING'].includes(activity.activityType) && (
                                    <div className="flex flex-col items-center gap-3">
                                        {!validating && (
                                            <>
                                                {!isRecording ? (
                                                    <button
                                                        onClick={startSpeechRecognition}
                                                        className="px-5 py-2 rounded-md font-medium transition bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-2"
                                                    >
                                                        <Mic size={24} /> Start speaking
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={stopSpeechRecognition}
                                                        className="px-5 py-2 rounded-md font-medium transition bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                                                    >
                                                        <Square size={24} /> Stop
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {isRecording && (
                                            <p className="text-sm text-gray-600">Recording... Speak now.</p>
                                        )}

                                        {validating && (
                                            <p className="text-sm text-gray-600">Validating...</p>
                                        )}
                                    </div>
                                )}

                            {showAnswer && (
                                <div className="mt-6">
                                    {['TRANSLATING_TEXT', 'TRANSLATING_AUDIO', 'WRITING', 'TRANSCRIBING', 'PRONUNCIATION', 'SPEAKING'].includes(activity.activityType) && (
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
                                                {['WRITING', 'TRANSCRIBING', 'SPEAKING'].includes(activity.activityType) && activity.text}
                                                {['PRONUNCIATION', 'SPEAKING'].includes(activity.activityType) && (
                                                    <>
                                                        &nbsp;
                                                        <button
                                                            aria-label="Play audio"
                                                            onClick={playAudio}
                                                            className={`
                                                                p-2 rounded-full transition
                                                                ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}
                                                              text-white
                                        `}
                                                        >
                                                            {isPlaying ? '⏹️' : '🔊'}
                                                        </button>
                                                    </>
                                                )}
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
                                                        } text-white px-4 py-2 rounded-md flex flex-col items-center md:flex-1 md:max-w-[165px] min-w-fit`}
                                                >
                                                    <span className="text-base font-semibold">{option.description}</span>
                                                    <span className="text-sm">{option.intervalDescription}</span>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {['TRANSLATING_TEXT', 'TRANSLATING_AUDIO', 'WRITING', 'TRANSCRIBING', 'PRONUNCIATION', 'SPEAKING'].includes(activity.activityType) && showAnswer && (
                                <div className="flex justify-end mt-4">
                                    <button
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                        onClick={() => handleNext(activity, null, true)}
                                    >
                                        Try again
                                    </button>
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
                                        <p className="text-gray-700 mb-6">Are you sure you want to skip this activity?<br /> It will be reviewed tomorrow.</p>
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
                </motion.div>
            </AnimatePresence>
        </PageWrapper>
    );
}