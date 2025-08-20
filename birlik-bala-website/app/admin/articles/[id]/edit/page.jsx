"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-2 mb-2">
      <Button
        type="button"
        variant={editor.isActive("bold") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        Bold
      </Button>
      <Button
        type="button"
        variant={editor.isActive("italic") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        Italic
      </Button>
      <Button
        type="button"
        variant={editor.isActive("bulletList") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
      >
        Bullet List
      </Button>
      <Button
        type="button"
        variant={editor.isActive("orderedList") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
      >
        Ordered List
      </Button>
      <Button
        type="button"
        variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
        onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
        disabled={!editor.can().chain().focus().setHeading({ level: 2 }).run()}
      >
        Heading 2
      </Button>
      <Button
        type="button"
        variant={editor.isActive("link") ? "default" : "outline"}
        onClick={() => {
          const url = prompt("Enter URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          } else {
            editor.chain().focus().unsetLink().run();
          }
        }}
        disabled={!editor.can().chain().focus().toggleLink().run()}
      >
        Link
      </Button>
    </div>
  );
};

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [article, setArticle] = useState({
    title: "",
    content: "",
    category: [],
    author: "",
    readTime: "",
    slug: "",
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: true,
        italic: true,
        bulletList: true,
        orderedList: true,
        heading: { levels: [1, 2, 3] },
      }),
      TiptapLink.configure({ openOnClick: false }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      console.log("[EditArticlePage] Editor updated, content:", editor.getHTML());
      setArticle((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    immediatelyRender: false,
  });

  const categoryOptions = [
    { value: "АФК", label: "АФК" },
    { value: "Сенсорные игры", label: "Сенсорные игры" },
    { value: "Коммуникативные игры", label: "Коммуникативные игры" },
    { value: "Нейроигры", label: "Нейроигры" },
  ];

  const generateSlug = (title) => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/g, "-")
        .replace(/(^-|-$)+/g, "") || "article-" + Date.now()
    );
  };

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];
        console.log("[EditArticlePage] Access token:", token || "none");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`/api/articles/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        console.log("[EditArticlePage] Fetch article response status:", response.status);
        const data = await response.json();
        console.log("[EditArticlePage] Fetch article response body:", data);

        
        if (!response.ok) {
          console.error("[EditArticlePage] Failed to fetch article:", response.status, data);
          throw new Error(data.error || `HTTP ошибка: ${response.status}`);
        }

        setArticle({
          title: data.article.title || "",
          content: data.article.content || "",
          category: Array.isArray(data.article.category) ? data.article.category : [],
          author: data.article.author || "",
          readTime: data.article.readTime ? String(data.article.readTime) : "",
          slug: data.article.slug || "",
        });

        if (editor && data.article.content) {
          editor.commands.setContent(data.article.content);
        }
      } catch (error) {
        console.error("[EditArticlePage] Fetch error:", error.message);
        setError(error.message);
        toast.error(`Ошибка при загрузке статьи: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, editor]);

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
    console.log("[EditArticlePage] Selected categories:", selected);
    setArticle({ ...article, category: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!article.title.trim() || article.title.length < 3) {
      toast.error("Название статьи должно быть не короче 3 символов");
      setLoading(false);
      return;
    }
    if (!article.content.trim() || article.content === "<p></p>") {
      toast.error("Введите содержание статьи");
      setLoading(false);
      return;
    }
    if (article.category.length === 0) {
      toast.error("Выберите хотя бы одну категорию");
      setLoading(false);
      return;
    }
    if (!article.author.trim() || article.author.length < 2) {
      toast.error("Имя автора должно быть не короче 2 символов");
      setLoading(false);
      return;
    }
    const readTimeNum = parseInt(article.readTime);
    if (!article.readTime || isNaN(readTimeNum) || readTimeNum <= 0) {
      toast.error("Введите корректное время чтения (в минутах, больше 0)");
      setLoading(false);
      return;
    }
    if (!article.slug.trim() || article.slug.length < 3) {
      toast.error("Slug должен быть не короче 3 символов");
      setLoading(false);
      return;
    }

    try {
      const jsonData = {
        title: article.title,
        content: article.content,
        category: Array.isArray(article.category) 
                  ? article.category.join(",") 
                  : article.category,
        author: article.author,
        readTime: readTimeNum,
        slug: article.slug,
      };

      

      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      console.log("[EditArticlePage] Access token for update:", token || "none");
      console.log("[EditArticlePage] JSON data:", jsonData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      console.log("JSON.stringify(jsonData):", JSON.stringify(jsonData));

      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(jsonData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log(response)

      console.log("[EditArticlePage] Update article response status:", response.status);
      const result = await response.json();
      console.log("[EditArticlePage] Update article response body:", result);

      if (!response.ok) {
        console.error("[EditArticlePage] Failed to update article:", response.status, result);
        toast.error(`Ошибка при обновлении статьи: ${result.error || result.message || "Неизвестная ошибка"}`);
        setLoading(false);
        return;
      }

      toast.success("Статья успешно обновлена");
      router.push("/admin");
    } catch (error) {
      console.error("[EditArticlePage] Update error:", error.message);
      setError(error.message);
      toast.error(`Ошибка: ${error.message || "Не удалось выполнить запрос"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      article.title ||
      article.content ||
      article.category.length > 0 ||
      article.author ||
      article.readTime ||
      article.slug
    ) {
      if (
        confirm(
          "Вы уверены, что хотите отменить редактирование? Все изменения будут потеряны."
        )
      ) {
        router.push("/admin");
      }
    } else {
      router.push("/admin");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Редактировать статью</h1>
          <p className="text-gray-600">Обновите информацию и содержание статьи</p>
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Название статьи *</Label>
              <Input
                id="title"
                value={article.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setArticle({ ...article, title, slug: generateSlug(title) });
                }}
                placeholder="Введите название статьи (мин. 3 символа)"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">
                Категории * (удерживайте Ctrl/Cmd для множественного выбора)
              </Label>
              <select
                id="category"
                multiple
                value={article.category}
                onChange={handleCategoryChange}
                className="w-full border rounded p-2 h-32"
                required
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="author">Автор *</Label>
              <Input
                id="author"
                value={article.author}
                onChange={(e) => setArticle({ ...article, author: e.target.value })}
                placeholder="Введите имя автора (мин. 2 символа)"
                required
              />
            </div>
            <div>
              <Label htmlFor="readTime">Время чтения (минуты) *</Label>
              <Input
                id="readTime"
                type="number"
                value={article.readTime}
                onChange={(e) => setArticle({ ...article, readTime: e.target.value })}
                placeholder="5"
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={article.slug}
                onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                placeholder="например, novaia-statya (мин. 3 символа)"
                required
              />
            </div>
            <div>
              <Label htmlFor="content">Содержание статьи *</Label>
              {editor ? (
                <>
                  <MenuBar editor={editor} />
                  <EditorContent
                    editor={editor}
                    className="border rounded p-2 bg-white min-h-[200px]"
                  />
                </>
              ) : (
                <p className="text-gray-500">Загрузка редактора...</p>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading} className="min-w-32">
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Отменить
          </Button>
        </div>
      </form>
    </div>
  );
}
