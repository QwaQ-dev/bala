
## Endpoints for user:
```bash
api/v1/user/sign-in
api/v1/user/sign-up
api/v1/auth/user/get-info
```

## Requests for user:
```bash
{
    "username": "",
    "password": ""
}
```

## Endpoints for checklists:
```bash
api/v1/auth/checklist/create  CREATE
api/v1/auth/checklist/update  UPDATE
api/v1/user/checklist/get     GET ALL
api/v1/user/checklist/get/:id GET BY ID
api/v1/auth/checklist/:id     DELETE BY ID
```

## Requests for checklists:
```bash
POST:

{
    "title": "",
    "description": "",
    "forAge": ,
    "slug": ""
}

PUT:

{
    "title": "",
    "description": "",
    "forAge": ,
    "slug": ""
}
```

## Endpoints for articles:
```bash
api/v1/auth/article/create    CREATE
api/v1/auth/article/update    UPDATE
api/v1/user/article/get       GET ALL
api/v1/user/article/get/:id   GET BY ID
api/v1/auth/article/:id       DELETE BY ID
```

## Requests for articles:
```bash

POST:

{
    "title": "",
    "content": "",
    "category": "АФК", "Сенсорные игры", "Коммуникативные игры", "Нейроигры",
    "author": "",
    "readTime": ,
    "slug": ""
}

PUT:

{
    "title": "",
    "content": "",
    "category": "АФК", "Сенсорные игры", "Коммуникативные игры", "Нейроигры",
    "author": "",
    "readTime": ,
    "slug": ""
}
```

## Endpoints for courses:
```bash

api/v1/auth/course/create     CREATE
api/v1/auth/course/update     UPDATE
api/v1/auth/course/:id        DELETE BY ID
api/v1/auth/course/get:id     GET BY ID
api/v1/auth/course/add-video  ADD VIDEO
``` 

## Requests for courses:
```bash
POST:

FORM-DATA:
    "title": "",
    "description": "",
    "cost": ,
    "img": file

PUT:

FORM-DATA:
    "title": "",
    "description": "",
    "cost": ,
    "img": file

POST:
    "course_id": ,
    "video": file.
```

Backend start:
```bash

    cd/backend
    docker compose -up --build

```