import PageWrapper from "../../components/page-wrapper/PageWrapper";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContexts";
import { useNavigate } from "react-router-dom";
import { countFlashcardsViewedToday, getReviewCount, saveFeedback } from "../../services/httpService";
import Confetti from '../../components/confetti/Confetti';
import toast from "react-hot-toast";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function CompletedActivity() {
    const { type } = useParams();
    const [quantityLearned, setQuantityLearned] = useState(0);
    const [quantityReviewed, setQuantityReviewed] = useState(0);
    const [countForReview, setCountForReview] = useState(0);
    const [sendingFeedback, setSendingFeedback] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [liked, setLiked] = useState(null);

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchActiviesViewed = async () => {
            try {
                const activitiesViewedResponseDto = await countFlashcardsViewedToday(user);
                setQuantityLearned(activitiesViewedResponseDto.learned);
                setQuantityReviewed(activitiesViewedResponseDto.reviewed);
            } catch (error) {
                console.error("Failed to load activies viewed: ", error);
                navigate("/");
            }
        };
        fetchActiviesViewed();

        const fetchCountForReview = async () => {
            try {
                const reviewCount = await getReviewCount(user);
                setCountForReview(reviewCount);
            } catch (error) {
                console.error("Failed to load count for review: ", error);
                navigate("/");
            }
        };
        fetchCountForReview();
    }, [user, navigate]);

    const sendFeedback = async () => {
        if (liked === null) {
            toast.error("Please select if you liked the activities");
            return;
        }
        setSendingFeedback(true);
        try {
            await saveFeedback(user, {
                text: feedbackText,
                liked: liked
            });
            toast.success("Thanks for your feedback!");
            setFeedbackText("");
            setLiked(null);
            setFeedbackModalOpen(false);
        } catch (error) {
            console.error("Failed to send feedback: ", error);
            toast.error("Failed to send feedback.");
        } finally {
            setSendingFeedback(false);
        }
    }

    return (
        <PageWrapper>
            <Confetti duration={3500} />
            <main className="flex items-center justify-center px-4 py-10">
                <div className="bg-white text-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md">
                    <div className="text-center mb-6 space-y-4">
                        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Congratulations!</h1>
                        {(quantityLearned !== 0 && quantityReviewed !== 0) && (
                            <p id="summaryText" className="text-lg md:text-xl font-medium text-gray-800">
                                You learned <span className="font-semibold text-purple-700">{quantityLearned}</span> {quantityLearned === 1 ? " sentence " : " sentences "}<br />
                                and reviewed <span className="font-semibold text-purple-700">{quantityReviewed}</span> {quantityReviewed === 1 ? " sentence " : " sentences "}
                                today!
                            </p>
                        )}
                        {(quantityLearned !== 0 && quantityReviewed === 0) && (
                            <p id="summaryText" className="text-lg md:text-xl font-medium text-gray-800">
                                You learned <span className="font-semibold text-purple-700">{quantityLearned}</span> {quantityLearned === 1 ? " sentence " : " sentences "} today!
                            </p>
                        )}
                        {(quantityLearned === 0 && quantityReviewed !== 0) && (
                            <p id="summaryText" className="text-lg md:text-xl font-medium text-gray-800">
                                You reviewed <span className="font-semibold text-purple-700">{quantityReviewed}</span> {quantityReviewed === 1 ? " sentence " : " sentences "} today!
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 w-full max-w-sm">
                        {!(countForReview === 0 && type === "review") && (
                            <>
                                <button id="continueBtn"
                                    onClick={() => navigate(`/activity/${type}`)}
                                    className="w-full inline-flex items-center justify-center gap-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 text-white px-4 py-3 rounded-lg font-semibold transition"
                                    aria-label="Continue current activity">
                                    Continue current activity
                                </button>
                                <button id="chooseBtn"
                                    onClick={() => navigate("/choose-activity-type")}
                                    className="w-full inline-flex items-center justify-center gap-3 bg-white border border-purple-200 text-purple-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-purple-100 px-4 py-3 rounded-lg font-semibold transition"
                                    aria-label="Choose another activity">
                                    Choose another activity
                                </button>
                            </>
                        )}

                        {(countForReview === 0 && type === "review") && (
                            <button id="chooseBtn"
                                onClick={() => navigate("/choose-activity-type")}
                                className="w-full inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 text-white px-4 py-3 rounded-lg font-semibold transition"
                                aria-label="Choose another activity">
                                Choose another activity
                            </button>
                        )}

                        <button
                            onClick={() => setFeedbackModalOpen(true)}
                            className="w-full inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 text-white px-4 py-3 rounded-lg font-semibold transition"
                            aria-label="Send Feedback">
                            Send Feedback
                        </button>
                    </div>
                </div>
            </main>

            {feedbackModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 transition-opacity duration-300 ease-out">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-out scale-100 opacity-100">
                        <h2 className="text-xl font-bold mb-4">Your Feedback</h2>

                        <div className="flex justify-center gap-6 mb-4">
                            <button
                                onClick={() => setLiked(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border 
                                    ${liked === true ? "bg-green-100 border-green-500 text-green-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                            >
                                <ThumbsUp size={20} /> Like
                            </button>
                            <button
                                onClick={() => setLiked(false)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border 
                                    ${liked === false ? "bg-red-100 border-red-500 text-red-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                            >
                                <ThumbsDown size={20} /> Dislike
                            </button>
                        </div>

                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-400 bg-white text-gray-900"
                            rows={4}
                            placeholder="Add a comment (optional)..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setFeedbackModalOpen(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                                disabled={sendingFeedback}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendFeedback}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                disabled={sendingFeedback}
                            >
                                {sendingFeedback ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}
