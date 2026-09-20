import { reviewsApi, booksApi } from "@/lib/api";
import ReviewsClient from "./reviews-client";

export default async function ReviewsPage() {
  const [reviews, books] = await Promise.all([reviewsApi.getAll(), booksApi.getAll()]);
  return <ReviewsClient initialReviews={reviews} books={books} />;
}