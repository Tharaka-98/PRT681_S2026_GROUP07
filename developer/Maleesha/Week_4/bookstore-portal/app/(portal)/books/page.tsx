import { booksApi, authorsApi } from "@/lib/api";
import BooksClient from "./books-client";

export default async function BooksPage() {
  const [books, authors] = await Promise.all([booksApi.getAll(), authorsApi.getAll()]);
  return <BooksClient initialBooks={books} authors={authors} />;
}