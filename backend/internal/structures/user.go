package structures

type User struct {
	Id       int64  `json:"id, omitempty"`
	Username string `json:"username"`
	Password string `json:"password"`
	Courses  []int  `json:"courses, omitempty"`
	Role     string `json:"role"`
}
