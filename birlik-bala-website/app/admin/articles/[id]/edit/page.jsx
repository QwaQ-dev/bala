"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { toast } from "sonner"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapLink from "@tiptap/extension-link"
import { Node } from "@tiptap/core"

const CustomImage = Node.create({
  name: "image",
  group: "block",
  selectable: true,
  atom: true,

  parseHTML() {
    return [{ tag: "img[data-path]" }]
  },

  renderHTML({ HTMLAttributes }) {
    const path = HTMLAttributes["data-path"]
    return [
      "img",
      {
        ...HTMLAttributes,
        "data-path": path,
        src: HTMLAttributes.src || `http://localhost:8081/uploads/articles/${path}`,
        alt: path || "Image",
        style: "max-width: 500px; width: 100%; height: auto;",
      },
    ]
  },

  addAttributes() {
    return {
      "data-path": { default: null },
      src: { default: null },
    }
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              "data-path": options["data-path"],
              src: `http://localhost:8081/uploads/articles/${options["data-path"]}`,
            },
          }),
    }
  },

  addNodeView() {
    return ({ node }) => {
      const div = document.createElement("div")
      const img = document.createElement("img")
      const path = node.attrs["data-path"] || ""

      img.setAttribute("data-path", path)
      img.setAttribute("src", `http://localhost:8081/uploads/articles/${path}`)
      img.setAttribute("alt", path || "Image")
      img.setAttribute("style", "max-width: 500px; width: 100%; height: auto;")

      div.appendChild(img)
      return { dom: div, contentDOM: null }
    }
  },
})

const Video = Node.create({
  name: "video",
  group: "block",
  selectable: true,
  atom: true,

  parseHTML() {
    return [{ tag: "video[data-path]" }]
  },

  renderHTML({ HTMLAttributes }) {
    const path = HTMLAttributes["data-path"]
    return [
      "video",
      {
        ...HTMLAttributes,
        "data-path": path,
        src: `http://localhost:8081/uploads/articles/${path}`,
        controls: true,
        style: "width: 100%; max-width: 600px; height: auto;",
      },
    ]
  },

  addAttributes() {
    return {
      "data-path": { default: null },
      src: { default: null },
    }
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              "data-path": options["data-path"],
              src: `http://localhost:8081/uploads/articles/${options["data-path"]}`,
            },
          }),
    }
  },

  addNodeView() {
    return ({ node }) => {
      const div = document.createElement("div")
      const video = document.createElement("video")
      const path = node.attrs["data-path"] || ""

      video.setAttribute("data-path", path)
      video.setAttribute("src", `http://localhost:8081/uploads/articles/${path}`)
      video.setAttribute("controls", "true")
      video.setAttribute("style", "width: 100%; max-width: 600px; height: auto;")

      div.appendChild(video)
      return { dom: div, contentDOM: null }
    }
  },
})

const MenuBar = ({ editor, onAddMedia }) => {
  if (!editor) return null

  const addImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      if (file.size > 100 * 1024 * 1024) {
        toast.error(`Файл ${file.name} превышает лимит в 100 МБ`)
        return
      }

      editor.chain().focus().setImage({ "data-path": file.name }).run()
      if (onAddMedia) onAddMedia(file)
    }
    input.click()
  }

  const addVideo = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "video/mp4"
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      if (file.size > 100 * 1024 * 1024) {
        toast.error(`Файл ${file.name} превышает лимит в 100 МБ`)
        return
      }

      editor.chain().focus().setVideo({ "data-path": file.name }).run()
      if (onAddMedia) onAddMedia(file)
    }
    input.click()
  }

  return (
    <div className="space-y-2 mb-4 p-2 border rounded bg-gray-50">
      {/* Text Formatting Row */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          Жирный
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          Курсив
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("underline") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
        >
          Подчеркнутый
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("strike") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
        >
          Зачеркнутый
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("code") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
        >
          Код
        </Button>
      </div>

      {/* Headings Row */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
        >
          • Список
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        >
          1. Нумерованный
        </Button>
      </div>

      {/* Structure & Media Row */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("blockquote") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={!editor.can().chain().focus().toggleBlockquote().run()}
        >
          Цитата
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("codeBlock") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        >
          Блок кода
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={!editor.can().chain().focus().setHorizontalRule().run()}
        >
          Разделитель
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Button type="button" size="sm" variant="outline" onClick={addImage}>
          📷 Изображение
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={addVideo}>
          🎥 Видео
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          ↶ Отменить
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          ↷ Повторить
        </Button>
      </div>
    </div>
  )
}

export default function EditArticlePage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [article, setArticle] = useState({
    title: "",
    content: "",
    category: [],
    author: "",
    readTime: "",
    slug: "",
    files: [],
  })

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
      CustomImage,
      Video,
    ],
    content: "",
    onUpdate: ({ editor }) => {
       ("[EditArticlePage] Editor updated, content:", editor.getHTML())
      setArticle((prev) => ({ ...prev, content: editor.getHTML() }))
    },
    immediatelyRender: false,
  })

  const categoryOptions = [
    { value: "АФК", label: "АФК" },
    { value: "Сенсорные игры", label: "Сенсорные игры" },
    { value: "Коммуникативные игры", label: "Коммуникативные игры" },
    { value: "Нейроигры", label: "Нейроигры" },
  ]

  const generateSlug = (title) => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/g, "-")
        .replace(/(^-|-$)+/g, "") || "article-" + Date.now()
    )
  }

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1]


        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        const response = await fetch(`/api/articles/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          signal: controller.signal,
        })
        clearTimeout(timeoutId)


        const data = await response.json()


        if (!response.ok) {

          throw new Error(data.error || `HTTP ошибка: ${response.status}`)
        }

        setArticle({
          title: data.article.title || "",
          content: data.article.content || "",
          category: Array.isArray(data.article.category) ? data.article.category : [],
          author: data.article.author || "",
          readTime: data.article.readTime ? String(data.article.readTime) : "",
          slug: data.article.slug || "",
          files: [],
        })

        if (editor && data.article.content) {
          editor.commands.setContent(data.article.content)
        }
      } catch (error) {

        setError(error.message)
        toast.error(`Ошибка при загрузке статьи: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id, editor])

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((option) => option.value)

    setArticle({ ...article, category: selected })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!article.title.trim() || article.title.length < 3) {
      toast.error("Название статьи должно быть не короче 3 символов")
      setLoading(false)
      return
    }
    if (!article.content.trim() || article.content === "<p></p>") {
      toast.error("Введите содержание статьи")
      setLoading(false)
      return
    }
    if (article.category.length === 0) {
      toast.error("Выберите хотя бы одну категорию")
      setLoading(false)
      return
    }
    if (!article.author.trim() || article.author.length < 2) {
      toast.error("Имя автора должно быть не короче 2 символов")
      setLoading(false)
      return
    }
    const readTimeNum = Number.parseInt(article.readTime)
    if (!article.readTime || isNaN(readTimeNum) || readTimeNum <= 0) {
      toast.error("Введите корректное время чтения (в минутах, больше 0)")
      setLoading(false)
      return
    }
    if (!article.slug.trim() || article.slug.length < 3) {
      toast.error("Slug должен быть не короче 3 символов")
      setLoading(false)
      return
    }

    try {
      const jsonData = {
        title: article.title,
        content: article.content,
        category: Array.isArray(article.category) ? article.category.join(",") : article.category,
        author: article.author,
        readTime: readTimeNum,
        slug: article.slug,
      }

      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1]



      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)


      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(jsonData),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)



      const result = await response.json()


      if (!response.ok) {

        toast.error(`Ошибка при обновлении статьи: ${result.error || result.message || "Неизвестная ошибка"}`)
        setLoading(false)
        return
      }

      toast.success("Статья успешно обновлена")
      router.push("/admin")
    } catch (error) {

      setError(error.message)
      toast.error(`Ошибка: ${error.message || "Не удалось выполнить запрос"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (
      article.title ||
      article.content ||
      article.category.length > 0 ||
      article.author ||
      article.readTime ||
      article.slug
    ) {
      if (confirm("Вы уверены, что хотите отменить редактирование? Все изменения будут потеряны.")) {
        router.push("/admin")
      }
    } else {
      router.push("/admin")
    }
  }

  const handleAddMedia = (file) => {
    setArticle((prev) => ({ ...prev, files: [...prev.files, file] }))
  }

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
    )
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
                  const title = e.target.value
                  setArticle({ ...article, title, slug: generateSlug(title) })
                }}
                placeholder="Введите название статьи (мин. 3 символа)"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Категории * (удерживайте Ctrl/Cmd для множественного выбора)</Label>
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
                  <MenuBar editor={editor} onAddMedia={handleAddMedia} />
                  <EditorContent editor={editor} className="border rounded p-2 bg-white min-h-[200px]" />
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
  )
}
