package structures

import "time"

type Course struct {
	Id          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Cost        int       `json:"cost"`
	DiplomaPath string    `json:"diploma_path"`
	Diploma_x   int       `json:"diploma_x"`
	Diploma_y   int       `json:"diploma_y"`
	Videos      []Video   `json:"videos, omitempty"`
	Webinars    []Webinar `json:"webinars"`
	Img         string    `json:"img"`
}

type Video struct {
	Id    int    `json:"id"`
	Path  string `json:"path"`
	Title string `json:"title"`
	File  string `json:"file"`
}

type CourseAccessRequest struct {
	UserID   int `json:"user_id"`
	CourseID int `json:"course_id"`
}

type CourseWithAccess struct {
	Course
	HasAccess bool `json:"has_access"`
}

type Webinar struct {
	Id       int       `json:"id"`
	Title    string    `json:"title"`
	Link     string    `json:"link"`
	Date     time.Time `json:"date"`
	CourseID int       `json:"course_id"`
}
