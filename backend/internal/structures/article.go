package structures

type ArticleCategory string

const (
	SensorGamesCategory      ArticleCategory = "Сенсорные игры"
	AFK                      ArticleCategory = "АФК"
	CommunicateGamesCategory ArticleCategory = "Коммуникативные игры"
	NeuroGamesCategory       ArticleCategory = "Нейроигры"
)

type Article struct {
	Id       int           `json:"id"`
	Title    string        `json:"title"`
	Content  string        `json:"content"`
	Category string        `json:"category"`
	Author   string        `json:"author"`
	ReadTime int           `json:"readTime"`
	Slug     string        `json:"slug"`
	Files    []ArticleFile `json:"files,omitempty"`
}

type ArticleFile struct {
	Id        int    `json:"id"`
	ArticleId int    `json:"articleId"`
	FileName  string `json:"fileName"`
	FilePath  string `json:"filePath"`
}
