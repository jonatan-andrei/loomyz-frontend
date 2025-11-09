//const apiUrl = "http://localhost:8099"
const apiUrl = "/api"

export async function updateUser(user, payload) {
    const idToken = await user.getIdToken();

    const response = await fetch(apiUrl + "/user", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Error saving user: ${response.statusText}`);
    }

    return response.json();
}

export async function getNativeLanguages() {
    const response = await fetch(apiUrl + "/native-language/1");
    if (!response.ok) {
        throw new Error("Failed to load native languages");
    }
    return await response.json();
}

export async function verifyExistsPendingRegistration(user) {
    const idToken = await user.getIdToken();
    const response = await fetch(apiUrl + "/user/exists-pending-registration", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return await response.json();
}

export async function getReviewCount(user) {
    const idToken = await user.getIdToken();
    const response = await fetch(apiUrl + "/activity/count-for-review", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response.json();
}

export async function countFlashcardsViewedToday(user, userDate) {
    const idToken = await user.getIdToken();
    const response = await fetch(apiUrl + "/activity/count-viewed-today/" + userDate, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response.json();
}

export async function getActivities(user, activityType) {
    const idToken = await user.getIdToken();
    const response = await fetch(apiUrl + "/activity/" + activityType, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response.json();
}

export async function saveFlashcard(user, activityId, payload) {
    const idToken = await user.getIdToken();

    const response = await fetch(apiUrl + "/activity/save-flashcard/" + activityId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Error saving flashcard: ${response.statusText}`);
    }

    return response.json();
}

export async function skipFlashcard(user, activityId) {
    const idToken = await user.getIdToken();

    const response = await fetch(apiUrl + "/activity/skip-flashcard/" + activityId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error skiping flashcard: ${response.statusText}`);
    }

    return response.json();
}

export async function validateActivity(user, activityId, payload) {
    const idToken = await user.getIdToken();

    const response = await fetch(apiUrl + "/activity/validate/" + activityId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Error validate text: ${response.statusText}`);
    }

    return response.json();
}

export async function saveFeedback(user, payload) {
    const idToken = await user.getIdToken();

    const response = await fetch(apiUrl + "/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Error save Feedback: ${response.statusText}`);
    }

    return response.json();
}

