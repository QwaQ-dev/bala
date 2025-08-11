package structures

type User struct {
	Id       int64  `json:"id, omitempty"`
	Username string `json:"username"`
	Password string `json:"password"`
	IsPaid   bool   `json:"isPaid, omitempty"`
}
