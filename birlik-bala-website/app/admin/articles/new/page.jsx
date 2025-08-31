"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Undo, Redo, List, ListOrdered, Quote, Code, Minus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapLink from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
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
    const src = HTMLAttributes["src"] || `http://localhost:8080/uploads/articles/${path}`
    return [
      "img",
      {
        ...HTMLAttributes,
        "data-path": path,
        src,
        alt: path || "Image",
        style: "max-width: 500px; width: 100%; height: auto;",
      },
    ]
  },

  addAttributes() {
    return {
      "data-path": { default: null },
      src: { default: null }, // Allow src to be set for preview
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
              src: options.src || `http://localhost:8080/uploads/articles/${options["data-path"]}`,
            },
          }),
    }
  },

  addNodeView() {
    return ({ node }) => {
      const div = document.createElement("div")
      const img = document.createElement("img")
      const path = node.attrs["data-path"] || ""
      const src = node.attrs["src"] || `http://localhost:8080/uploads/articles/${path}`

      img.setAttribute("data-path", path)
      img.setAttribute("src", src)
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
    return [{ tag: "video[data-path]" }, { tag: "div[data-path][data-type='video']" }]
  },

  renderHTML({ HTMLAttributes }) {
    const path = HTMLAttributes["data-path"]
    const src = HTMLAttributes["src"] || `http://localhost:8080/uploads/articles/${path}`
    return [
      "video",
      {
        ...HTMLAttributes,
        "data-path": path,
        src,
        controls: true,
        style: "width: 100%; max-width: 600px; height: auto;",
      },
    ]
  },

  addAttributes() {
    return {
      "data-path": { default: null },
      "data-type": { default: "video" },
      src: { default: null }, // Allow src to be set for preview
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
              src: options.src || `http://localhost:8080/uploads/articles/${options["data-path"]}`,
              "data-type": "video",
            },
          }),
    }
  },

  addNodeView() {
    return ({ node }) => {
      const div = document.createElement("div")
      const video = document.createElement("video")
      const path = node.attrs["data-path"] || ""
      const src = node.attrs["src"] || `http://localhost:8080/uploads/articles/${path}`

      video.setAttribute("data-path", path)
      video.setAttribute("src", src)
      video.setAttribute("controls", "true")
      video.setAttribute("style", "width: 100%; max-width: 600px; height: auto;")

      div.appendChild(video)
      return { dom: div, contentDOM: null }
    }
  },
})

const MenuBar = ({ editor, onAddMedia }) => {
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

      const previewUrl = URL.createObjectURL(file)
      editor.chain().focus().setImage({ "data-path": file.name, src: previewUrl }).run()
      onAddMedia(file, previewUrl)
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

      const previewUrl = URL.createObjectURL(file)
      editor.chain().focus().setVideo({ "data-path": file.name, src: previewUrl }).run()
      onAddMedia(file, previewUrl)
    }
    input.click()
  }

  if (!editor) return null

  return (
    <div className="border rounded-t p-2 bg-gray-50">
      {/* First row - Basic formatting */}
      <div className="flex flex-wrap gap-1 mb-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("code") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>

      {/* Second row - Headings and structure */}
      <div className="flex flex-wrap gap-1 mb-2">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("codeBlock") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"</>"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      {/* Third row - Media */}
      <div className="flex flex-wrap gap-1">
        <Button type="button" size="sm" variant="outline" onClick={addImage}>
          📷 Изображение
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={addVideo}>
          🎥 Видео (MP4)
        </Button>
      </div>
    </div>
  )
}

export default function NewArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [article, setArticle] = useState({
    title: "",
    content: "",
    category: "",
    author: "",
    readTime: "",
    slug: "",
    files: [],
    filePreviews: {}, // Store temporary URLs for preview
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: true,
        italic: true,
        strike: true,
        code: true,
        codeBlock: true,
        blockquote: true,
        horizontalRule: true,
        bulletList: true,
        orderedList: true,
        heading: { levels: [1, 2, 3] },
        history: true,
      }),
      TiptapLink.configure({ openOnClick: false }),
      Underline,
      CustomImage,
      Video,
    ],
    content: article.content,
    onUpdate: ({ editor }) => {
      // Update content with server paths when submitting
      let updatedContent = editor.getHTML()
      Object.entries(article.filePreviews).forEach(([previewUrl, fileName]) => {
        updatedContent = updatedContent.replaceAll(
          previewUrl,
          `http://localhost:8080/uploads/articles/${fileName}`
        )
      })
      setArticle({ ...article, content: updatedContent })
    },
    immediatelyRender: false,
  })

  const categoryOptions = [
    { value: "", label: "Выберите категорию" },
    { value: "АФК", label: "АФК" },
    { value: "Сенсорные игры", label: "Сенсорные игры" },
    { value: "Коммуникативные игры", label: "Коммуникативные игры" },
    { value: "Нейроигры", label: "Нейроигры" },
  ]

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "article-" + Date.now()

  const handleCategoryChange = (e) => setArticle({ ...article, category: e.target.value })

  const handleAddMedia = (file, previewUrl) => {
    setArticle((prev) => ({
      ...prev,
      files: [...prev.files, file],
      filePreviews: { ...prev.filePreviews, [previewUrl]: file.name },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!article.title.trim() || article.title.length < 3)
      return toast.error("Название статьи должно быть не короче 3 символов")

    if (!article.content.trim() || article.content === "<p></p>")
      return toast.error("Введите содержание статьи")

    if (!article.category) return toast.error("Выберите категорию")

    if (!article.author.trim() || article.author.length < 2)
      return toast.error("Имя автора должно быть не короче 2 символов")

    const readTimeNum = Number.parseInt(article.readTime)
    if (!article.readTime || isNaN(readTimeNum) || readTimeNum <= 0)
      return toast.error("Введите корректное время чтения")

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", article.title)
      formData.append("content", article.content)
      formData.append("category", article.category)
      formData.append("author", article.author)
      formData.append("readTime", article.readTime)
      formData.append("slug", article.slug)

      article.files.forEach((file) => formData.append("files", file))

      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1]

      const response = await fetch("/api/admin/articles/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
      })

      if (!response.ok) throw new Error(await response.text())

      toast.success("Статья успешно создана")
      router.push("/admin")
    } catch (err) {
      toast.error(`Ошибка: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (
      article.title ||
      article.content ||
      article.category ||
      article.author ||
      article.readTime ||
      article.slug ||
      article.files.length
    ) {
      if (!confirm("Вы уверены, что хотите отменить создание статьи? Все изменения будут потеряны.")) return
    }
    router.push("/admin")
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
                  const title = e.target.value
                  setArticle({ ...article, title, slug: generateSlug(title) })
                }}
                placeholder="Введите название статьи (мин. 3 символа)"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Категория *</Label>
              <select
                id="category"
                value={article.category}
                onChange={handleCategoryChange}
                className="w-full border rounded p-2"
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
                <div className="border rounded">
                  <MenuBar editor={editor} onAddMedia={handleAddMedia} />
                  <EditorContent editor={editor} className="p-3 bg-white min-h-[200px] prose max-w-none" />
                </div>
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
  )
}
