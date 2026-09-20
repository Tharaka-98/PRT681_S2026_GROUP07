import { authorsApi } from "@/lib/api";
import AuthorsClient from "./authors-client";

export default async function AuthorsPage() {
  const authors = await authorsApi.getAll();
  return <AuthorsClient initialAuthors={authors} />;
}