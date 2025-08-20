-- Создание enum типа с защитой
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_category') THEN
        CREATE TYPE public.article_category AS ENUM (
            'Сенсорные игры',
            'АФК',
            'Коммуникативные игры',
            'Нейроигры'
        );
    END IF;
END$$;

-- Таблицы с IF NOT EXISTS
CREATE SEQUENCE IF NOT EXISTS public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.articles (
    id integer NOT NULL DEFAULT nextval('public.articles_id_seq'::regclass),
    title character varying(100) NOT NULL,
    content text,
    category public.article_category NOT NULL,
    author character varying(200),
    read_time integer,
    slug text,
    CONSTRAINT articles_pkey PRIMARY KEY (id)
);

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;

-- ======================
-- Таблица файлов статей
-- ======================
CREATE SEQUENCE IF NOT EXISTS public.article_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.article_files (
    id integer NOT NULL DEFAULT nextval('public.article_files_id_seq'::regclass),
    article_id integer NOT NULL,
    path text NOT NULL,
    type character varying(100), -- "image/jpeg", "video/mp4" и т.д.
    CONSTRAINT article_files_pkey PRIMARY KEY (id),
    CONSTRAINT article_files_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE,
    CONSTRAINT unique_article_file UNIQUE(article_id, path)
);

ALTER SEQUENCE public.article_files_id_seq OWNED BY public.article_files.id;

CREATE INDEX IF NOT EXISTS idx_article_files_article_id ON public.article_files(article_id);

-- ======================
-- Таблица чеклистов
-- ======================
CREATE SEQUENCE IF NOT EXISTS public.checklists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.checklists (
    id integer NOT NULL DEFAULT nextval('public.checklists_id_seq'::regclass),
    title character varying(100) NOT NULL,
    description text,
    for_age integer,
    slug text,
    CONSTRAINT checklists_pkey PRIMARY KEY (id)
);

ALTER SEQUENCE public.checklists_id_seq OWNED BY public.checklists.id;

-- ======================
-- Таблица курсов
-- ======================
CREATE SEQUENCE IF NOT EXISTS public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.courses (
    id integer NOT NULL DEFAULT nextval('public.courses_id_seq'::regclass),
    title text NOT NULL,
    description text NOT NULL,
    cost integer NOT NULL,
    img text NOT NULL,
    CONSTRAINT courses_pkey PRIMARY KEY (id)
);

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;

-- ======================
-- Таблица пользователей
-- ======================
CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.users (
    id integer NOT NULL DEFAULT nextval('public.users_id_seq'::regclass),
    username character varying(155) NOT NULL,
    password character varying(255) NOT NULL,
    course_ids integer[] DEFAULT '{}',
    role character varying(255) DEFAULT 'user',
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

-- ======================
-- Таблица видео
-- ======================
CREATE SEQUENCE IF NOT EXISTS public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.videos (
    id integer NOT NULL DEFAULT nextval('public.videos_id_seq'::regclass),
    path text NOT NULL,
    title text NOT NULL,
    course_id integer,
    CONSTRAINT videos_pkey PRIMARY KEY (id),
    CONSTRAINT videos_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;
