"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewChecklistPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [forAge, setForAge] = useState("");
  const [slug, setSlug] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      console.log("[NewChecklistPage] Access token:", token || "none");

      const response = await fetch("/api/admin/checklists/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ title, description, forAge: parseInt(forAge), slug, url }),
      });
      console.log("[NewChecklistPage] Create checklist response status:", response.status);
      const responseText = await response.text();
      console.log("[NewChecklistPage] Create checklist response body:", responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("[NewChecklistPage] JSON parse error:", parseError.message, responseText);
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        console.error("[NewChecklistPage] Failed to create checklist:", response.status, data);
        throw new Error(data.error || `Failed to create checklist: ${response.status}`);
      }

      console.log("[NewChecklistPage] Checklist created successfully:", data);
      setSuccess(`Чеклист "${title}" успешно создан`);
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err) {
      console.error("[NewChecklistPage] Error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Создать новый чеклист</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="mb-4 bg-green-100 text-green-800">
          <AlertTitle>Успех</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Название
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Описание
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>
        <div>
          <label htmlFor="forAge" className="block text-sm font-medium text-gray-700">
            Возраст (лет)
          </label>
          <Input
            id="forAge"
            type="number"
            value={forAge}
            onChange={(e) => setForAge(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Ссылка на гугл диск
          </label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Создать чеклист
        </Button>
      </form>
    </div>
  );
}