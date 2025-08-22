export async function updateUser(user, payload) {
    const idToken = await user.getIdToken();

    const response = await fetch("http://localhost:8099/user", {
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
    const response = await fetch("http://localhost:8099/native-language/1");
    if (!response.ok) {
        throw new Error("Failed to load native languages");
    }
    return await response.json();
}

export async function verifyExistsPendingRegistration(user) {
    const idToken = await user.getIdToken();
    const response = await fetch("http://localhost:8099/user/exists-pending-registration", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return await response.json();
}

export async function getReviewCount(user) {
    const idToken = await user.getIdToken();
    const response = await fetch("http://localhost:8099/activity/count-for-review", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response.json();
}

export async function countFlashcardsViewedToday(user) {
    const idToken = await user.getIdToken();
    const response = await fetch("http://localhost:8099/activity/count-viewed-today", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response.json();
}

export async function getActivities(user, activityType) {
    const idToken = await user.getIdToken();
    const response = await fetch("http://localhost:8099/activity/" + activityType, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response.json();
}

export async function saveFlashcard(user, activityId, payload) {
    const idToken = await user.getIdToken();

    const response = await fetch("http://localhost:8099/activity/save-flashcard/" + activityId, {
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

export async function validateTextActivity(user, payload) {
    const idToken = await user.getIdToken();

    const response = await fetch("http://localhost:8099/activity/validate-text", {
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

