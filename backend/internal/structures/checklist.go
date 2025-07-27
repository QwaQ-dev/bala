package structures

type Checklist struct {
	Id          int64  `json:"id, omitempty"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ForAge      int    `json:"forAge"`
	Slug        string `json:"slug"`
}
