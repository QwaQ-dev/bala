
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
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

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    content: article.content,
    onUpdate: ({ editor }) => {
      console.log("[NewArticlePage] Editor updated, content:", editor.getHTML());
      setArticle({ ...article, content: editor.getHTML() });
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

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (option) => option.value,
    );
    setArticle({ ...article, category: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced validation
    if (!article.title.trim() || article.title.length < 3) {
      toast.error("Название статьи должно быть не короче 3 символов");
      return;
    }
    if (!article.content.trim() || article.content === "<p></p>") {
      toast.error("Введите содержание статьи");
      return;
    }
    if (article.category.length === 0) {
      toast.error("Выберите хотя бы одну категорию");
      return;
    }
    if (!article.author.trim() || article.author.length < 2) {
      toast.error("Имя автора должно быть не короче 2 символов");
      return;
    }
    const readTimeNum = parseInt(article.readTime);
    if (!article.readTime || isNaN(readTimeNum) || readTimeNum <= 0) {
      toast.error("Введите корректное время чтения (в минутах, больше 0)");
      return;
    }
    if (!article.slug.trim() || article.slug.length < 3) {
      toast.error("Slug должен быть не короче 3 символов");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", article.title);
      formData.append("content", article.content);
      article.category.forEach((cat) => formData.append("category[]", cat));
      formData.append("author", article.author);
      formData.append("readTime", article.readTime);
      formData.append("slug", article.slug);

      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      console.log("[NewArticlePage] Access token:", token || "none");
      console.log("[NewArticlePage] FormData entries:", [...formData.entries()]);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch("/api/admin/articles/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log("[NewArticlePage] Create article response status:", response.status);
      console.log("[NewArticlePage] Create article response headers:", [...response.headers.entries()]);
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      console.log("[NewArticlePage] Create article response body:", responseText);

      let result = {};
      console.log(response)
      // Handle success (2xx status) regardless of content-type
      if (response.status >= 200 && response.status < 300 ) {
        if (contentType && contentType.includes("application/json")) {
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error("[NewArticlePage] JSON parse error:", parseError.message, responseText);
            throw new Error(`Не удалось разобрать JSON: ${responseText.slice(0, 100)}...`);
          }
        } else {
          // Treat plain text response as success
          console.log("[NewArticlePage] Non-JSON success response:", responseText);
          result = { message: responseText || "Статья создана" };
        }
      } else {
        console.error("[NewArticlePage] Error response:", response.status, responseText);
        // Attempt to parse JSON for error details
        if (contentType && contentType.includes("application/json")) {
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error("[NewArticlePage] JSON parse error for error response:", parseError.message, responseText);
            throw new Error(`Ошибка сервера: ${responseText.slice(0, 100)}...`);
          }
        } else {
          throw new Error(`Ошибка сервера: ${responseText.slice(0, 100)}...`);
        }
        throw new Error(result.error || result.message || "Неизвестная ошибка");
      }

      console.log("[NewArticlePage] Article created successfully:", result);
      toast.success(result.message || "Статья успешно создана");
      router.push("/admin");
    } catch (error) {
      console.error("[NewArticlePage] Error:", error.message, error.stack);
      toast.error(`Ошибка: ${error.message || "Не удалось создать статью"}`);
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
          "Вы уверены, что хотите отменить создание статьи? Все изменения будут потеряны.",
        )
      ) {
        router.push("/admin");
      }
    } else {
      router.push("/admin");
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Создать новую статью</h1>
          <p className="text-gray-600">Добавьте информацию и содержание статьи</p>
        </div>
      </div>
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
                onChange={(e) =>
                  setArticle({ ...article, author: e.target.value })
                }
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
                onChange={(e) =>
                  setArticle({ ...article, readTime: e.target.value })
                }
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
                onChange={(e) =>
                  setArticle({ ...article, slug: e.target.value })
                }
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
            {loading ? "Создание..." : "Создать статью"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Отменить
          </Button>
        </div>
      </form>
    </div>
  );
}
