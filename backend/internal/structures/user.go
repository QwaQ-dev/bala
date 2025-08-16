package structures

import "github.com/lib/pq"

type User struct {
	Id        int64         `json:"id, omitempty"`
	Username  string        `json:"username"`
	Password  string        `json:"password"`
	CourseIDs pq.Int64Array `db:"course_ids"`
	Role      string        `json:"role"`
}
