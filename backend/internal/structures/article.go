package structures

type ArticleCategory string

const (
	SensorGamesCategory      ArticleCategory = "Сенсорные игры"
	AFK                      ArticleCategory = "АФК"
	CommunicateGamesCategory ArticleCategory = "Коммуникативные игры"
	NeuroGamesCategory       ArticleCategory = "Нейроигры"
)

type Article struct {
	Id       int64           `json:"id, omitempty"`
	Title    string          `json:"title"`
	Content  string          `json:"content"`
	Category ArticleCategory `json:"category"`
	Author   string          `json:"author"`
	ReadTime int             `json:"readTime"`
	Slug     string          `json:"slug"`
}
