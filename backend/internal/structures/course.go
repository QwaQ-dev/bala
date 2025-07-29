package structures

type Course struct {
	Id          int     `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Cost        int     `json:"cost"`
	Videos      []Video `json:"videos, omitempty"`
	Img         string  `json:"img"`
}

type Video struct {
	Id       int    `json:"id"`
	Path     string `json:"path"`
	CourseID int    `json:"courseId"`
}
