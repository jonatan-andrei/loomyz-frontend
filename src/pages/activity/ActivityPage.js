import PageWrapper from "../../components/page-wrapper/PageWrapper";
import { useParams } from "react-router-dom";

export default function CompletedActivity() {
    const { type } = useParams();

    return (
        <PageWrapper>
            {type}
        </PageWrapper>
    );
}