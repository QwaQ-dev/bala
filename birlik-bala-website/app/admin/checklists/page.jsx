"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function AdminChecklistsPage() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      console.log("[AdminChecklistsPage] Access token:", token || "none");

      const response = await fetch("/api/checklists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      console.log("[AdminChecklistsPage] Fetch checklists response status:", response.status);
      const responseText = await response.text();
      console.log("[AdminChecklistsPage] Fetch checklists response body:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        if (!Array.isArray(data)) {
          console.error("[AdminChecklistsPage] Expected checklists array:", data);
          throw new Error("Invalid checklists data format");
        }
      } catch (parseError) {
        console.error("[AdminChecklistsPage] JSON parse error:", parseError.message, responseText);
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        console.error("[AdminChecklistsPage] Failed to fetch checklists:", response.status, data);
        throw new Error(data.error || `HTTP error: ${response.status}`);
      }

      setChecklists(data);
    } catch (error) {
      console.error("[AdminChecklistsPage] Failed to load checklists:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    setSuccess(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      console.log("[AdminChecklistsPage] Access token for delete:", token || "none");

      const response = await fetch(`/api/admin/checklists/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      console.log("[AdminChecklistsPage] Delete checklist response status:", response.status);
      const responseText = await response.text();
      console.log("[AdminChecklistsPage] Delete checklist response body:", responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("[AdminChecklistsPage] JSON parse error:", parseError.message, responseText);
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        console.error("[AdminChecklistsPage] Failed to delete checklist:", response.status, data);
        throw new Error(data.error || `Failed to delete checklist: ${response.status}`);
      }

      console.log("[AdminChecklistsPage] Checklist deleted successfully:", id);
      setSuccess(`Чеклист с ID ${id} успешно удалён`);
      setChecklists(checklists.filter((checklist) => checklist.id !== id));
    } catch (error) {
      console.error("[AdminChecklistsPage] Delete error:", error.message);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Управление чеклистами</h1>
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
      <div className="mb-8">
        <Link href="/admin/checklists/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Создать чеклист
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {checklists.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Чеклисты не найдены</h3>
            <p className="text-gray-600">Создайте новый чеклист или попробуйте позже</p>
          </div>
        )}
        {checklists.map((checklist) => (
          <Card key={checklist.id} className="flex items-center justify-between">
            <CardHeader>
              <CardTitle>{checklist.title}</CardTitle>
              <p className="text-sm text-gray-600">{checklist.description}</p>
              <p className="text-sm text-gray-500">Возраст: {checklist.forAge} лет</p>
              <p className="text-sm text-gray-500">Slug: {checklist.slug}</p>
              <p className="text-sm text-gray-500 truncate">URL: {checklist.url}</p>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDelete(checklist.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}