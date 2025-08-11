-- Удаление внешнего ключа (если он есть)
ALTER TABLE IF EXISTS public.videos DROP CONSTRAINT IF EXISTS videos_course_id_fkey;

-- Удаление таблиц
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.checklists CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;

-- Удаление последовательностей
DROP SEQUENCE IF EXISTS public.videos_id_seq;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP SEQUENCE IF EXISTS public.courses_id_seq;
DROP SEQUENCE IF EXISTS public.checklists_id_seq;
DROP SEQUENCE IF EXISTS public.articles_id_seq;

-- Удаление типа enum
DROP TYPE IF EXISTS public.article_category;
