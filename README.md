


## Endpoints for user:
```bash
api/v1/user/sign-in
api/v1/user/sign-up
```
## Endpoints for checklists:
```bash
api/v1/auth/checklist/create  CREATE
api/v1/auth/checklist/update  UPDATE
api/v1/auth/checklist/get     GET ALL
api/v1/auth/checklist/get/:id GET BY ID
api/v1/auth/checklist/:id     DELETE BY ID
```

## Endpoints for articles:
```bash
api/v1/auth/article/create    CREATE
api/v1/auth/article/update    UPDATE
api/v1/auth/article/get       GET ALL
api/v1/auth/article/get/:id   GET BY ID
api/v1/auth/article/:id       DELETE BY ID
```

## Requests for checklists:
```bash
{
    "title": "",
    "description": "",
    "forAge": ,
    "slug": ""
}
```
## Requests for articles:
```bash
{
    "title": "",
    "content": "",
    "category": "АФК", "Сенсорные игры", "Коммуникативные игры", "Нейроигры",
    "author": "",
    "readTime": ,
    "slug": ""
}
```