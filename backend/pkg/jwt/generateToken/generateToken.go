package generatetoken

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateAccessToken(id int, secretKey, role string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": id,
		"role":   role,
		"exp":    time.Now().Add(time.Hour * 336).Unix(),
		"type":   "access",
	})

	t, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return t, nil
}
