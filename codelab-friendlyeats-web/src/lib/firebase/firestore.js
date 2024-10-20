import {
	collection,
	onSnapshot,
	query,
	getDocs,
	doc,
	getDoc,
	updateDoc,
	orderBy,
	addDoc,
	runTransaction,
	Timestamp
} from "firebase/firestore";
import { db } from "@/src/lib/firebase/clientApp";

export function applyQueryFilters(q, { category, city, price, sort }) {
	if (category) q = query(q, where("category", "==", category));
	if (city) q = query(q, where("city", "==", city));
	if (price) q = query(q, where("price", "==", price.length));
	if (!sort || sort === "Rating") q = query(q, orderBy("avgRating", "desc"));
	else if (sort === "Review") q = query(q, orderBy("numRatings", "desc"));
	return q;
}

export async function getRestaurants(filters = {}) {
	let q = query(collection(db, "restaurants"));
	q = applyQueryFilters(q, filters);
	const results = await getDocs(q);
	return results.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
		timestamp: doc.data().timestamp.toDate(),
	}));
}

export function getRestaurantsSnapshot(cb, filters = {}) {
	let q = query(collection(db, "restaurants"));
	q = applyQueryFilters(q, filters);
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const results = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
			timestamp: doc.data().timestamp.toDate(),
		}));
		cb(results);
	});
	return unsubscribe;
}

export async function getRestaurantById(restaurantId) {
	const docRef = doc(db, "restaurants", restaurantId);
	const docSnap = await getDoc(docRef);
	if (!docSnap.exists()) {
		throw new Error("No such restaurant found");
	}
	return {
		id: docSnap.id,
		...docSnap.data(),
		timestamp: docSnap.data().timestamp.toDate(),
	};
}

export async function addReviewToRestaurant(restaurantId, review) {
	if (!restaurantId) throw new Error("No restaurant ID has been provided.");
	if (!review) throw new Error("A valid review has not been provided.");

	const docRef = doc(collection(db, "restaurants"), restaurantId);
	const newRatingDocument = doc(
		collection(db, `restaurants/${restaurantId}/ratings`)
	);

	try {
		await runTransaction(db, async (transaction) => {
			const restaurant = await transaction.get(docRef);
			const data = restaurant.data();
			const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
			const newSumRating =
				(data?.sumRating || 0) + Number(review.rating);
			const newAverage = newSumRating / newNumRatings;

			transaction.update(docRef, {
				numRatings: newNumRatings,
				sumRating: newSumRating,
				avgRating: newAverage,
			});

			transaction.set(newRatingDocument, {
				...review,
				timestamp: Timestamp.fromDate(new Date()),
			});
		});
	} catch (error) {
		console.error("There was an error adding the rating to the restaurant", error);
		throw error;
	}
}

export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
	const q = query(
		collection(db, "restaurants", restaurantId, "ratings"),
		orderBy("timestamp", "desc")
	);
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const results = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
			timestamp: doc.data().timestamp.toDate(),
		}));
		cb(results);
	});
	return unsubscribe;
}
