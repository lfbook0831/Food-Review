"use server";

import { addReviewToRestaurant } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

export async function handleReviewFormSubmission(data) {
    const { app } = await getAuthenticatedAppForUser();
    const db = getFirestore(app);
    
    await addReviewToRestaurant(db, data.get("restaurantId"), {
        text: data.get("text"),
        rating: data.get("rating"),
        userId: data.get("userId"),
    });
}
